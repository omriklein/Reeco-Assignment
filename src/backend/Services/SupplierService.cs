using backend.Data;
using backend.Models.DTOs;
using backend.Models.DTOs.Suppliers;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SupplierService(AppDbContext db) : ISupplierService
{
    public async Task<PagedResponse<SupplierListDto>> GetSuppliersAsync(int limit, int offset)
    {
        var total = await db.Suppliers.CountAsync();
        var suppliers = await db.Suppliers
            .OrderBy(s => s.Id)
            .Skip(offset)
            .Take(limit)
            .Select(s => new SupplierListDto(
                s.Id, s.Name, s.Email, s.Rating, s.Country, s.Active, s.CreatedAt))
            .ToListAsync();

        return new PagedResponse<SupplierListDto>(suppliers, total, limit, offset);
    }

    public async Task<SupplierDetailDto?> GetSupplierByIdAsync(string id)
    {
        var supplier = await db.Suppliers.FirstOrDefaultAsync(s => s.Id == id);
        if (supplier is null) return null;

        var stats = await db.Orders
            .Where(o => o.SupplierId == id)
            .GroupBy(_ => 1)
            .Select(g => new { OrderCount = g.Count(), TotalRevenue = g.Sum(o => o.TotalPrice) })
            .FirstOrDefaultAsync();

        return new SupplierDetailDto(
            supplier.Id, supplier.Name, supplier.Email, supplier.Rating,
            supplier.Country, supplier.Active, supplier.CreatedAt,
            stats?.OrderCount ?? 0,
            stats?.TotalRevenue ?? 0m);
    }

    public async Task<SupplierPerformanceDto?> GetSupplierPerformanceAsync(string id)
    {
        var exists = await db.Suppliers.AnyAsync(s => s.Id == id);
        if (!exists) return null;

        var orders = await db.Orders
            .Where(o => o.SupplierId == id)
            .Select(o => new { o.Status, o.CreatedAt, o.UpdatedAt, o.UnitPrice, o.ProductId })
            .ToListAsync();

        if (orders.Count == 0)
            return new SupplierPerformanceDto(0, 0, 0, []);

        var total = orders.Count;
        var rejectionRate = (double)orders.Count(o => o.Status == OrderStatus.Rejected) / total;

        var delivered = orders.Where(o => o.Status == OrderStatus.Delivered).ToList();
        var avgDeliveryDays = delivered.Count > 0
            ? delivered.Average(o => Math.Abs((o.UpdatedAt - o.CreatedAt).TotalDays))
            : 0;

        // Per-product price consistency: how consistently does supplier price each product?
        // Weighted average of (1 - CV) per product, where CV = stddev/mean of unit_price.
        var byProduct = orders
            .GroupBy(o => o.ProductId)
            .Where(g => g.Count() > 1)
            .ToList();

        double priceConsistency = 0;
        if (byProduct.Count > 0)
        {
            double weightedSum = 0;
            int totalWeight = 0;
            foreach (var g in byProduct)
            {
                var productPrices = g.Select(o => (double)o.UnitPrice).ToList();
                var mean = productPrices.Average();
                if (mean == 0) continue;
                var variance = productPrices.Sum(p => Math.Pow(p - mean, 2)) / (productPrices.Count - 1);
                var stdDev = Math.Sqrt(variance);
                var consistency = 1.0 - stdDev / mean;
                weightedSum += consistency * productPrices.Count;
                totalWeight += productPrices.Count;
            }
            priceConsistency = totalWeight > 0 ? weightedSum / totalWeight : 0;
        }

        var monthlyTrend = orders
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g =>
            {
                var deliveredInMonth = g.Where(o => o.Status == OrderStatus.Delivered).ToList();
                var avgDays = deliveredInMonth.Count > 0
                    ? (decimal)deliveredInMonth.Average(o => Math.Abs((o.UpdatedAt - o.CreatedAt).TotalDays))
                    : 0m;
                return new MonthlyTrendEntry(
                    $"{g.Key.Year:D4}-{g.Key.Month:D2}",
                    g.Count(),
                    g.Sum(o => o.UnitPrice),
                    avgDays);
            })
            .ToList();

        return new SupplierPerformanceDto(avgDeliveryDays, rejectionRate, priceConsistency, monthlyTrend);
    }
}
