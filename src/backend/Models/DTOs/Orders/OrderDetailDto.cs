namespace backend.Models.DTOs.Orders;

public record OrderDetailDto(
    string Id,
    string SupplierId,
    string SupplierName,
    string ProductId,
    string ProductName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    string Status,
    string Priority,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string? Warehouse,
    string? Notes
);
