using backend.Models.DTOs.Orders;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int limit = 20,
        [FromQuery] int offset = 0)
    {
        var result = await orderService.GetOrdersAsync(limit, offset);
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
