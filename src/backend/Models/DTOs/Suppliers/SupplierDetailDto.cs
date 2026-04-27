namespace backend.Models.DTOs.Suppliers;

public record SupplierDetailDto(
    string Id,
    string Name,
    string? Email,
    decimal? Rating,
    string? Country,
    bool Active,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalRevenue
);
