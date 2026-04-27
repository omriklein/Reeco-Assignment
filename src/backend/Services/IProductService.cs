using backend.Models.DTOs;
using backend.Models.DTOs.Products;

namespace backend.Services;

public interface IProductService
{
    Task<PagedResponse<ProductListDto>> GetProductsAsync(int limit, int offset, string? categoryId);
}
