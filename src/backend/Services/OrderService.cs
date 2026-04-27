using backend.Data;
using backend.Models.DTOs;
using backend.Models.DTOs.Orders;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class OrderService(AppDbContext db) : IOrderService
{
    private static readonly HashSet<string> ValidStatuses =
    [
        "pending", "approved", "rejected", "shipped", "delivered", "cancelled"
    ];

    public async Task<PagedResponse<OrderListDto>> GetOrdersAsync(int limit, int offset)
    {
        var total = await db.Orders.CountAsync();
        var orders = await db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .OrderBy(o => o.Id)
            .Skip(offset)
            .Take(limit)
            .Select(o => new OrderListDto(
                o.Id, o.SupplierId, o.Supplier.Name, o.ProductId, o.Product.Name,
                o.Quantity, o.UnitPrice, o.TotalPrice, o.Status, o.Priority,
                o.CreatedAt, o.UpdatedAt, o.Warehouse, o.Notes))
            .ToListAsync();

        return new PagedResponse<OrderListDto>(orders, total, limit, offset);
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
        if (request.Status is not null && !ValidStatuses.Contains(request.Status))
            return (null, "Invalid status value", 400);

        var order = await db.Orders
            .Include(o => o.Supplier)
            .Include(o => o.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return (null, "Order not found", 404);

        if (order.Status == "cancelled")
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
}
