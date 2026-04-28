using backend.Data;
using backend.Models.DTOs;
using backend.Models.DTOs.Orders;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<PagedResponse<OrderListDto>> GetOrdersAsync(OrderQueryParams p)
    {
        var query = db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .AsQueryable();

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
            query = query.Where(o => o.Product != null &&
                o.Product.Name.ToLower().Contains(p.Search.ToLower()));

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

        if (request.Status is not null) order.Status = request.Status;
        if (request.Priority is not null) order.Priority = request.Priority;
        order.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        var dto = new OrderDetailDto(
            order.Id, order.SupplierId, order.Supplier.Name,
            order.ProductId, order.Product.Name,
            order.Quantity, order.UnitPrice, order.TotalPrice,
            order.Status, order.Priority,
            order.CreatedAt, order.UpdatedAt, order.Warehouse, order.Notes);

        return (dto, null, 200);
    }

    public async Task<OrderStatsDto> GetStatsAsync()
    {
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

        return new OrderStatsDto(
            totalOrders,
            totalRevenue,
            byStatus.ToDictionary(s => s.Status, s => new StatusStats(s.Count, s.TotalValue)),
            byMonth.Select(m => new MonthStats(
                $"{m.Year:D4}-{m.Month:D2}", m.OrderCount, m.Revenue)).ToList(),
            topSuppliers.Select(s => new SupplierRevenueStats(s.SupplierId, s.Name, s.TotalRevenue)).ToList(),
            byWarehouse.Select(w => new WarehouseStats(w.Warehouse, w.Count, w.TotalValue)).ToList()
        );
    }
}
