namespace backend.Models.DTOs.Suppliers;

public record SupplierListDto(
    string Id,
    string Name,
    string? Email,
    decimal? Rating,
    string? Country,
    bool Active,
    DateTime CreatedAt
);
