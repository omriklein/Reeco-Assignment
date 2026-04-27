namespace backend.Models.Entities;

public class Order
{
    public string Id { get; set; } = null!;
    public string SupplierId { get; set; } = null!;
    public string ProductId { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? Warehouse { get; set; }
    public string? Notes { get; set; }

    public Supplier Supplier { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
