using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0,
        [FromQuery] string? category = null)
    {
        var result = await productService.GetProductsAsync(limit, offset, category);
        return Ok(result);
    }
}
