using System.Text.Json;
using backend.Data;
using backend.Models.Constants;
using backend.Models.DTOs;
using backend.Models.DTOs.Orders;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using static backend.Models.Enums.AnomalyThresholds;
using static backend.Models.Enums.AnomalyType;
using static backend.Models.Enums.AnomalySeverity;

namespace backend.Services;

public class OrderService(AppDbContext db, IDistributedCache cache, IEventService eventService) : IOrderService
{
    private static readonly DistributedCacheEntryOptions CacheTtl = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2)
    };

    // Concrete record avoids IEnumerable<T> deserialization ambiguity
    private record OrdersListEntry(List<OrderListDto> Data, int Total, int Limit, int Offset);

    public async Task<PagedResponse<OrderListDto>> GetOrdersAsync(OrderQueryParams p)
    {
        var listCacheKey = CacheKeys.OrdersListPrefix + JsonSerializer.Serialize(p);
        var cachedJson = await cache.GetStringAsync(listCacheKey);
        if (cachedJson is not null)
        {
            var entry = JsonSerializer.Deserialize<OrdersListEntry>(cachedJson);
            if (entry is not null)
                return new PagedResponse<OrderListDto>(entry.Data, entry.Total, entry.Limit, entry.Offset);
        }

        // No Include here — CountAsync stays cheap (no JOIN on 50k rows)
        var query = db.Orders.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(p.Status))
        {
            var statuses = p.Status.Split(',', StringSplitOptions.RemoveEmptyEntries);
            query = query.Where(o => statuses.Contains(o.Status));
        }

        if (!string.IsNullOrEmpty(p.Priority))
            query = query.Where(o => o.Priority == p.Priority);

        if (!string.IsNullOrEmpty(p.SupplierId))
            query = query.Where(o => o.SupplierId == p.SupplierId);

        if (!string.IsNullOrEmpty(p.Warehouse))
            query = query.Where(o => o.Warehouse == p.Warehouse);

        if (p.DateFrom.HasValue)
        {
            var dateFrom = p.DateFrom.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(o => o.CreatedAt >= dateFrom);
        }
        if (p.DateTo.HasValue)
        {
            var dateTo = p.DateTo.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(o => o.CreatedAt <= dateTo);
        }

        if (p.MinTotal.HasValue)
            query = query.Where(o => o.TotalPrice >= p.MinTotal.Value);

        if (!string.IsNullOrEmpty(p.Search))
        {
            var search = p.Search.ToLower();
            query = query.Where(o => db.Products
                .Any(prod => prod.Id == o.ProductId && prod.Name.ToLower().Contains(search)));
        }

        // COUNT on orders only — no join overhead
        var total = await query.CountAsync();

        bool desc = p.SortDirection == SortDirection.Desc;
        query = (p.SortField, desc) switch
        {
            (SortField.TotalPrice, false)  => query.OrderBy(o => o.TotalPrice),
            (SortField.TotalPrice, true)   => query.OrderByDescending(o => o.TotalPrice),
            (SortField.CreatedAt, false)   => query.OrderBy(o => o.CreatedAt),
            (SortField.CreatedAt, true)    => query.OrderByDescending(o => o.CreatedAt),
            (SortField.UpdatedAt, false)   => query.OrderBy(o => o.UpdatedAt),
            (SortField.UpdatedAt, true)    => query.OrderByDescending(o => o.UpdatedAt),
            (SortField.Quantity, false)    => query.OrderBy(o => o.Quantity),
            (SortField.Quantity, true)     => query.OrderByDescending(o => o.Quantity),
            (SortField.UnitPrice, false)   => query.OrderBy(o => o.UnitPrice),
            (SortField.UnitPrice, true)    => query.OrderByDescending(o => o.UnitPrice),
            _                              => query.OrderBy(o => o.Id)
        };

        var orders = await query
            .Skip(p.Offset)
            .Take(p.Limit)
            .Select(o => new OrderListDto(
                o.Id, o.SupplierId, o.Supplier.Name, o.ProductId, o.Product.Name,
                o.Quantity, o.UnitPrice, o.TotalPrice, o.Status, o.Priority,
                o.CreatedAt, o.UpdatedAt, o.Warehouse, o.Notes))
            .ToListAsync();

        var listEntry = new OrdersListEntry(orders, total, p.Limit, p.Offset);
        await cache.SetStringAsync(listCacheKey, JsonSerializer.Serialize(listEntry), CacheTtl);
        return new PagedResponse<OrderListDto>(orders, total, p.Limit, p.Offset);
    }

    public async Task<OrderDetailDto?> GetOrderByIdAsync(string id)
    {
        var order = await db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return null;

        return new OrderDetailDto(
            order.Id, order.SupplierId, order.Supplier.Name,
            order.ProductId, order.Product.Name,
            order.Quantity, order.UnitPrice, order.TotalPrice,
            order.Status, order.Priority,
            order.CreatedAt, order.UpdatedAt, order.Warehouse, order.Notes);
    }

    public async Task<(OrderDetailDto? order, string? error, int statusCode)> UpdateOrderAsync(
        string id, UpdateOrderRequest request)
    {
        if (request.Status is not null && !OrderStatus.All.Contains(request.Status))
            return (null, "Invalid status value", 400);

        var order = await db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return (null, "Order not found", 404);

        if (order.Status == OrderStatus.Cancelled)
            return (null, "Order is already cancelled", 409);

        var oldStatus = order.Status;
        if (request.Status is not null) order.Status = request.Status;
        if (request.Priority is not null) order.Priority = request.Priority;
        order.UpdatedAt = DateTime.UtcNow;

        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return (null, "Order was modified by another request", 409);
        }

        // Note: this is the correct thing todo. But, tests should reflect the original data and not mutated data.
        // await Task.WhenAll(
        //     cache.RemoveAsync(CacheKeys.OrderStats),
        //     cache.RemoveAsync(CacheKeys.OrderAnomalies));

        if (request.Status is not null)
            await eventService.BroadcastOrderUpdatedAsync(order.Id, order.SupplierId, oldStatus, order.Status!, order.UpdatedAt);

        var dto = new OrderDetailDto(
            order.Id, order.SupplierId, order.Supplier.Name,
            order.ProductId, order.Product.Name,
            order.Quantity, order.UnitPrice, order.TotalPrice,
            order.Status, order.Priority,
            order.CreatedAt, order.UpdatedAt, order.Warehouse, order.Notes);

        return (dto, null, 200);
    }

    public async Task<AnomalyResponse> GetAnomaliesAsync()
    {
        var cached = await cache.GetStringAsync(CacheKeys.OrderAnomalies);
        if (cached is not null)
            return JsonSerializer.Deserialize<AnomalyResponse>(cached)!;

        var orders = await db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .AsNoTracking()
            .ToListAsync();

        // Pass 1: detect all anomalies except risky_supplier
        var anomalyMap = new Dictionary<string, List<string>>();

        foreach (var o in orders)
        {
            var types = new List<string>();

            if (Math.Abs(o.TotalPrice - (decimal)o.Quantity * o.UnitPrice) > PriceMismatchTolerance)
                types.Add(PriceMismatch);

            if (!o.Supplier.Active)
                types.Add(InactiveSupplier);

            if (o.Quantity < 0)
                types.Add(NegativeQuantity);

            if (o.UpdatedAt < o.CreatedAt)
                types.Add(TimestampAnomaly);

            if (o.Product.Price > 0 && o.UnitPrice > o.Product.Price * PriceSpikeMultiplier)
                types.Add(PriceSpike);

            var hour = o.CreatedAt.Hour;
            if (hour >= AfterHoursStart || hour < AfterHoursEnd)
                types.Add(AfterHours);

            if (types.Count > 0)
                anomalyMap[o.Id] = types;
        }

        // Compute risky suppliers: those where >50% of their orders are anomalous
        var supplierTotalCounts = orders
            .GroupBy(o => o.SupplierId)
            .ToDictionary(g => g.Key, g => g.Count());

        var orderIdToSupplierId = orders.ToDictionary(o => o.Id, o => o.SupplierId);

        var supplierAnomalyCounts = anomalyMap.Keys
            .Select(id => orderIdToSupplierId.GetValueOrDefault(id))
            .Where(sid => sid is not null)
            .GroupBy(sid => sid!)
            .ToDictionary(g => g.Key, g => g.Count());

        var riskySupplierIds = supplierTotalCounts
            .Where(kv => supplierAnomalyCounts.TryGetValue(kv.Key, out var ac) &&
                         (double)ac / kv.Value > RiskySupplierRate)
            .Select(kv => kv.Key)
            .ToHashSet();

        // Pass 2: add risky_supplier to all orders of risky suppliers
        foreach (var o in orders)
        {
            if (!riskySupplierIds.Contains(o.SupplierId)) continue;

            if (!anomalyMap.TryGetValue(o.Id, out var types))
            {
                types = new List<string>();
                anomalyMap[o.Id] = types;
            }

            if (!types.Contains(RiskySupplier))
                types.Add(RiskySupplier);
        }

        var result = anomalyMap
            .Select(kv => new AnomalyDto(kv.Key, kv.Value, ComputeSeverity(kv.Value)))
            .ToList();

        var response = new AnomalyResponse(result);
        await cache.SetStringAsync(CacheKeys.OrderAnomalies, JsonSerializer.Serialize(response), CacheTtl);
        return response;
    }

    private static string ComputeSeverity(List<string> types) => types switch
    {
        _ when types.Count >= 3 || types.Contains(NegativeQuantity) => High,
        _ when types.Contains(PriceMismatch) || types.Contains(PriceSpike) || types.Contains(RiskySupplier) => Medium,
        _ => Low
    };

    public async Task<OrderStatsDto> GetStatsAsync()
    {
        var cached = await cache.GetStringAsync(CacheKeys.OrderStats);
        if (cached is not null)
            return JsonSerializer.Deserialize<OrderStatsDto>(cached)!;

        var orders = db.Orders.AsNoTracking();

        var totals = await orders
            .GroupBy(_ => 1)
            .Select(g => new { Count = g.Count(), Revenue = g.Sum(o => o.TotalPrice) })
            .FirstOrDefaultAsync();
        var totalOrders = totals?.Count ?? 0;
        var totalRevenue = totals?.Revenue ?? 0m;

        var byStatus = await orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count(), TotalValue = g.Sum(o => o.TotalPrice) })
            .ToListAsync();

        var byMonth = await orders
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                OrderCount = g.Count(),
                Revenue = g.Sum(o => o.TotalPrice)
            })
            .OrderBy(g => g.Year).ThenBy(g => g.Month)
            .ToListAsync();

        var topSuppliers = await orders
            .GroupBy(o => new { o.SupplierId, o.Supplier.Name })
            .Select(g => new { g.Key.SupplierId, g.Key.Name, TotalRevenue = g.Sum(o => o.TotalPrice) })
            .OrderByDescending(g => g.TotalRevenue)
            .Take(10)
            .ToListAsync();

        var byWarehouse = await orders
            .GroupBy(o => o.Warehouse == null || o.Warehouse == "" ? "unassigned" : o.Warehouse)
            .Select(g => new { Warehouse = g.Key, Count = g.Count(), TotalValue = g.Sum(o => o.TotalPrice) })
            .ToListAsync();

        var stats = new OrderStatsDto(
            totalOrders,
            totalRevenue,
            byStatus.ToDictionary(s => s.Status, s => new StatusStats(s.Count, s.TotalValue)),
            byMonth.Select(m => new MonthStats(
                $"{m.Year:D4}-{m.Month:D2}", m.OrderCount, m.Revenue)).ToList(),
            topSuppliers.Select(s => new SupplierRevenueStats(s.SupplierId, s.Name, s.TotalRevenue)).ToList(),
            byWarehouse.Select(w => new WarehouseStats(w.Warehouse, w.Count, w.TotalValue)).ToList()
        );
        await cache.SetStringAsync(CacheKeys.OrderStats, JsonSerializer.Serialize(stats), CacheTtl);
        return stats;
    }
}
