using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;
using backend.Models.Constants;

namespace backend.Services;

public sealed class EventService : IEventService
{
    private readonly ConcurrentDictionary<Guid, ClientEntry> _clients = new();

    private sealed record ClientEntry(Channel<string> Channel, string? SupplierId);

    public async Task AddClientAsync(string? supplierId, HttpResponse response, CancellationToken ct)
    {
        response.Headers.Append("Content-Type", "text/event-stream");
        response.Headers.Append("Cache-Control", "no-cache");
        response.Headers.Append("X-Accel-Buffering", "no");

        // SSE comment flushes headers immediately; without it ASP.NET Core buffers until the first real write.
        await response.WriteAsync(": connected\n\n", ct);
        await response.Body.FlushAsync(ct);

        var clientId = Guid.NewGuid();
        var channel = Channel.CreateUnbounded<string>();
        _clients[clientId] = new ClientEntry(channel, supplierId);

        try
        {
            await foreach (var message in channel.Reader.ReadAllAsync(ct))
            {
                await response.WriteAsync($"data: {message}\n\n", ct);
                await response.Body.FlushAsync(ct);
            }
        }
        catch (OperationCanceledException) { }
        finally
        {
            _clients.TryRemove(clientId, out _);
        }
    }

    public Task BroadcastOrderUpdatedAsync(string orderId, string supplierId, string oldStatus, string newStatus, DateTime updatedAt)
    {
        var json = JsonSerializer.Serialize(new
        {
            type = EventTypes.OrderUpdated,
            data = new
            {
                id = orderId,
                old_status = oldStatus,
                new_status = newStatus,
                updated_at = updatedAt
            }
        });

        foreach (var (_, entry) in _clients)
        {
            if (entry.SupplierId is null || entry.SupplierId == supplierId)
                entry.Channel.Writer.TryWrite(json);
        }

        return Task.CompletedTask;
    }

    public Task BroadcastBulkCompletedAsync(string jobId)
    {
        var json = JsonSerializer.Serialize(new
        {
            type = EventTypes.BulkCompleted,
            data = new { jobId }
        });

        foreach (var (_, entry) in _clients)
            entry.Channel.Writer.TryWrite(json);

        return Task.CompletedTask;
    }
}