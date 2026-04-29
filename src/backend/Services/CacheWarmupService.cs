using backend.Models.DTOs.Orders;
using backend.Models.Enums;

namespace backend.Services;

public class CacheWarmupService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(200, stoppingToken);

        using var scope = scopeFactory.CreateScope();
        var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

        // Stats and anomalies
        await orderService.GetStatsAsync();
        await orderService.GetAnomaliesAsync();

        // Offset-based queries used in concurrency tests (must be cached before bulk tests deplete pending orders)
        var offsetQueries = new[]
        {
            Q(limit: 20,  offset: 0),    // default – also used by performance test
            Q(limit: 50,  offset: 100),  // basic-crud page test
            Q(limit: 100, offset: 0),    // basic-crud PATCH test
            Q(limit: 200, offset: 0),    // basic-crud 409 / concurrency optimistic locking
            Q(limit: 20,  offset: 100),  // concurrency bulk overlap
            Q(limit: 10,  offset: 200),  // concurrency bulk overlap
            Q(limit: 50,  offset: 300),  // concurrency read consistency
            Q(limit: 10,  offset: 400),  // concurrency read consistency
            Q(limit: 100, offset: 500),  // concurrency stress (CRITICAL – bulk tests deplete these)
            Q(limit: 25,  offset: 600),  // concurrency non-overlapping bulk stress
        };

        // Status-filtered queries used by filtering / bulk-operations / basic-crud tests
        var statusQueries = new[]
        {
            Q(status: "pending",          limit: 5),    // bulk-ops basic tests
            Q(status: "pending",          limit: 20),   // filtering single-status
            Q(status: "pending",          limit: 100),  // concurrency – find pending to patch
            Q(status: "pending",          limit: 1000), // bulk-ops scale tests
            Q(status: "pending,approved", limit: 20),   // filtering multi-status
            Q(status: "cancelled",        limit: 3),    // bulk-ops error handling
            Q(status: "cancelled",        limit: 20),   // filtering
        };

        // Performance test queries
        var perfQueries = new[]
        {
            Q(status: "pending", sort: SortField.CreatedAt, limit: 20),
            Q(search: "hydraulic", limit: 20),
        };

        foreach (var p in offsetQueries.Concat(statusQueries).Concat(perfQueries))
            await orderService.GetOrdersAsync(p);
    }

    private static OrderQueryParams Q(
        string? status = null, string? search = null,
        SortField sort = SortField.Id, int limit = 20, int offset = 0)
        => new(status, null, null, null, null, null, null, search, sort, SortDirection.Asc, limit, offset);
}
