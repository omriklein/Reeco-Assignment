namespace backend.Models.Entities;

public class Product
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? CategoryId { get; set; }
    public string Sku { get; set; } = null!;
    public decimal Price { get; set; }

    public Category? Category { get; set; }
    public ICollection<Order> Orders { get; set; } = [];
}
