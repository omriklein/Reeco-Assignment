using System.Collections.Concurrent;
using backend.Data;
using backend.Models;
using backend.Models.Constants;
using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace backend.Services;

public class BulkJobService(IServiceScopeFactory scopeFactory, IEventService eventService) : IBulkJobService
{
    private readonly ConcurrentDictionary<string, BulkJobState> _jobs = new();

    public string CreateJob(List<string> orderIds, string action)
    {
        var job = new BulkJobState
        {
            Id    = $"job_{Guid.NewGuid():N}",
            Total = orderIds.Count,
        };
        _jobs[job.Id] = job;

        _ = Task.Run(() => ProcessJobAsync(job, orderIds, action));

        return job.Id;
    }

    public BulkJobState? GetJob(string jobId) =>
        _jobs.TryGetValue(jobId, out var job) ? job : null;

    private async Task ProcessJobAsync(BulkJobState job, List<string> orderIds, string action)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var cache = scope.ServiceProvider.GetRequiredService<IDistributedCache>();

            var ids = orderIds.ToArray();

            // Find which IDs actually exist
            var existingIds = await db.Orders
                .Where(o => ids.Contains(o.Id))
                .Select(o => o.Id)
                .ToListAsync();

            var nonExistentCount = ids.Length - existingIds.Count;

            var newStatus = BulkActionType.ToOrderStatus(action);

            int updatedCount;
            int cancelledCount;

            if (newStatus is not null)
            {
                // Bulk update: skip cancelled orders
                updatedCount = await db.Orders
                    .Where(o => existingIds.Contains(o.Id) && o.Status != OrderStatus.Cancelled)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(o => o.Status, newStatus)
                        .SetProperty(o => o.UpdatedAt, DateTime.UtcNow));

                cancelledCount = existingIds.Count - updatedCount;
            }
            else
            {
                // flag action: validate orders exist and aren't cancelled, but don't change status
                var processableCount = await db.Orders
                    .CountAsync(o => existingIds.Contains(o.Id) && o.Status != OrderStatus.Cancelled);

                updatedCount  = processableCount;
                cancelledCount = existingIds.Count - processableCount;
            }

            job.Completed = updatedCount;
            job.Failed    = nonExistentCount + cancelledCount;
            job.Status    = JobStatus.Completed;

            await Task.WhenAll(
                cache.RemoveAsync(CacheKeys.OrderStats),
                cache.RemoveAsync(CacheKeys.OrderAnomalies));
        }
        catch
        {
            job.Status = JobStatus.Failed;
            return;
        }

        await eventService.BroadcastBulkCompletedAsync(job.Id);
    }
}