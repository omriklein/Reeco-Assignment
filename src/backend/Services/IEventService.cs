namespace backend.Services;

public interface IEventService
{
    Task AddClientAsync(string? supplierId, HttpResponse response, CancellationToken ct);
    Task BroadcastOrderUpdatedAsync(string orderId, string supplierId, string oldStatus, string newStatus, DateTime updatedAt);
    Task BroadcastBulkCompletedAsync(string jobId);
}