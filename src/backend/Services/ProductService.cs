using backend.Data;
using backend.Models.DTOs;
using backend.Models.DTOs.Products;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ProductService(AppDbContext db) : IProductService
{
    public async Task<PagedResponse<ProductListDto>> GetProductsAsync(
        int limit, int offset, string? categoryId)
    {
        IQueryable<backend.Models.Entities.Product> query = db.Products;

        if (categoryId is not null)
        {
            var categoryIds = await GetDescendantCategoryIdsAsync(categoryId);
            query = query.Where(p => p.CategoryId != null && categoryIds.Contains(p.CategoryId));
        }

        var total = await query.CountAsync();
        var products = await query
            .OrderBy(p => p.Id)
            .Skip(offset)
            .Take(limit)
            .Select(p => new ProductListDto(p.Id, p.Name, p.CategoryId, p.Sku, p.Price))
            .ToListAsync();

        return new PagedResponse<ProductListDto>(products, total, limit, offset);
    }

    private async Task<List<string>> GetDescendantCategoryIdsAsync(string rootId)
    {
        // Recursive CTE to collect rootId and all descendants
        var sql = """
            WITH RECURSIVE cat_tree AS (
                SELECT id FROM categories WHERE id = {0}
                UNION
                SELECT c.id FROM categories c
                JOIN cat_tree t ON c.parent_id = t.id
            )
            SELECT id FROM cat_tree
            """;

        return await db.Database
            .SqlQueryRaw<string>(sql, rootId)
            .ToListAsync();
    }
}
