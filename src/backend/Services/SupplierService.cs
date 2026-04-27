using backend.Data;
using backend.Models.DTOs;
using backend.Models.DTOs.Suppliers;
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
}
