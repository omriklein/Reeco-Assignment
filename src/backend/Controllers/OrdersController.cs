using backend.Models.DTOs;
using backend.Models.DTOs.Orders;
using backend.Models.Enums;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orderService, IBulkJobService bulkJobService) : ControllerBase
{
    private const int MaxBulkBatchSize = 10_000;

    [HttpPost("bulk-action")]
    [HttpPost("bulk")]
    public IActionResult BulkAction([FromBody] BulkActionRequest request)
    {
        if (request.OrderIds is null || request.OrderIds.Count == 0)
            return BadRequest(new { error = "orderIds must not be empty", code = "INVALID_REQUEST" });

        if (request.OrderIds.Count > MaxBulkBatchSize)
            return BadRequest(new { error = $"orderIds exceeds maximum of {MaxBulkBatchSize}", code = "INVALID_REQUEST" });

        if (string.IsNullOrWhiteSpace(request.Action) || !BulkActionType.All.Contains(request.Action))
            return BadRequest(new { error = $"Invalid action '{request.Action}'", code = "INVALID_ACTION" });

        var jobId = bulkJobService.CreateJob(request.OrderIds, request.Action);
        return StatusCode(202, new BulkActionResponse(jobId));
    }

    [HttpPost("bulk-actions")]
    public IActionResult BulkActions([FromBody] BulkActionsRequest request)
    {
        if (request.OrderIds is null || request.OrderIds.Count == 0)
            return BadRequest(new { error = "order_ids must not be empty", code = "INVALID_REQUEST" });

        if (request.OrderIds.Count > MaxBulkBatchSize)
            return BadRequest(new { error = $"order_ids exceeds maximum of {MaxBulkBatchSize}", code = "INVALID_REQUEST" });

        if (string.IsNullOrWhiteSpace(request.Action) || !BulkActionType.All.Contains(request.Action))
            return BadRequest(new { error = $"Invalid action '{request.Action}'", code = "INVALID_ACTION" });

        var jobId = bulkJobService.CreateJob(request.OrderIds, request.Action);
        return StatusCode(202, new BulkActionsResponse(jobId));
    }

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

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var stats = await orderService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpGet("anomalies")]
    public async Task<IActionResult> GetAnomalies()
    {
        var result = await orderService.GetAnomaliesAsync();
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
