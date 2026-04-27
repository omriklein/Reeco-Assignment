using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id");
            e.Property(o => o.SupplierId).HasColumnName("supplier_id");
            e.Property(o => o.ProductId).HasColumnName("product_id");
            e.Property(o => o.Quantity).HasColumnName("quantity");
            e.Property(o => o.UnitPrice).HasColumnName("unit_price");
            e.Property(o => o.TotalPrice).HasColumnName("total_price");
            e.Property(o => o.Status).HasColumnName("status").HasColumnType("text");
            e.Property(o => o.Priority).HasColumnName("priority").HasColumnType("text");
            e.Property(o => o.CreatedAt).HasColumnName("created_at");
            e.Property(o => o.UpdatedAt).HasColumnName("updated_at");
            e.Property(o => o.Warehouse).HasColumnName("warehouse");
            e.Property(o => o.Notes).HasColumnName("notes");
            e.HasOne(o => o.Supplier).WithMany(s => s.Orders).HasForeignKey(o => o.SupplierId);
            e.HasOne(o => o.Product).WithMany(p => p.Orders).HasForeignKey(o => o.ProductId);
        });

        modelBuilder.Entity<Supplier>(e =>
        {
            e.ToTable("suppliers");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.Name).HasColumnName("name");
            e.Property(s => s.Email).HasColumnName("email");
            e.Property(s => s.Rating).HasColumnName("rating");
            e.Property(s => s.Country).HasColumnName("country");
            e.Property(s => s.Active).HasColumnName("active");
            e.Property(s => s.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.Name).HasColumnName("name");
            e.Property(p => p.CategoryId).HasColumnName("category_id");
            e.Property(p => p.Sku).HasColumnName("sku");
            e.Property(p => p.Price).HasColumnName("price");
            e.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.Name).HasColumnName("name");
            e.Property(c => c.ParentId).HasColumnName("parent_id");
            e.HasOne(c => c.Parent).WithMany(c => c.Children).HasForeignKey(c => c.ParentId);
        });
    }
}
