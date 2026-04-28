using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/suppliers")]
public class SuppliersController(ISupplierService supplierService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetSuppliers(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        var result = await supplierService.GetSuppliersAsync(limit, offset);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSupplier(string id)
    {
        var supplier = await supplierService.GetSupplierByIdAsync(id);
        if (supplier is null)
            return NotFound(new { error = "Supplier not found" });

        return Ok(supplier);
    }

    [HttpGet("{id}/performance")]
    public async Task<IActionResult> GetSupplierPerformance(string id)
    {
        var perf = await supplierService.GetSupplierPerformanceAsync(id);
        if (perf is null)
            return NotFound(new { error = "Supplier not found" });

        return Ok(perf);
    }
}
