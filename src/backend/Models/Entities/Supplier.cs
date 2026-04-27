namespace backend.Models.Entities;

public class Supplier
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public decimal? Rating { get; set; }
    public string? Country { get; set; }
    public bool Active { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<Order> Orders { get; set; } = [];
}
