namespace backend.Models.DTOs.Products;

public record ProductListDto(
    string Id,
    string Name,
    string? CategoryId,
    string Sku,
    decimal Price
);
