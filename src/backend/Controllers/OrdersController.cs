using backend.Models.DTOs.Orders;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? supplier_id = null,
        [FromQuery] string? warehouse = null,
        [FromQuery] DateOnly? date_from = null,
        [FromQuery] DateOnly? date_to = null,
        [FromQuery] decimal? min_total = null,
        [FromQuery] string? search = null,
        [FromQuery] string? sort = null,
        [FromQuery] string? order = null,
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        var normalized = sort is null ? "" : string.Concat(sort.Split('_').Select(w => char.ToUpper(w[0]) + w[1..].ToLower()));
        var sortField = Enum.TryParse<SortField>(normalized, ignoreCase: true, out var sf) ? sf : SortField.Id;
        var sortDir = string.Equals(order, "desc", StringComparison.OrdinalIgnoreCase)
            ? SortDirection.Desc : SortDirection.Asc;

        var queryParams = new OrderQueryParams(status, priority, supplier_id,
            warehouse, date_from, date_to, min_total, search, sortField, sortDir, limit, offset);
        var result = await orderService.GetOrdersAsync(queryParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        var order = await orderService.GetOrderByIdAsync(id);
        if (order is null)
            return NotFound(new { error = "Order not found" });

        return Ok(order);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateOrder(string id, [FromBody] UpdateOrderRequest request)
    {
        var (order, error, statusCode) = await orderService.UpdateOrderAsync(id, request);

        return statusCode switch
        {
            200 => Ok(order),
            400 => BadRequest(new { error }),
            404 => NotFound(new { error }),
            409 => Conflict(new { error }),
            _ => StatusCode(statusCode, new { error })
        };
    }
}
