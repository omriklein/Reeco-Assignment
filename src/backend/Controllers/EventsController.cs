using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api")]
public class EventsController(IEventService eventService) : ControllerBase
{
    [HttpGet("events")]
    public async Task GetEvents([FromQuery] string? supplier_id, CancellationToken ct)
    {
        await eventService.AddClientAsync(supplier_id, Response, ct);
    }
}