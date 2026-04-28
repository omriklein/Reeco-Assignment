using backend.Models.DTOs.Orders;

namespace backend.Services;

public class CacheWarmupService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(200, stoppingToken);

        using var scope = scopeFactory.CreateScope();
        var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

        await orderService.GetOrdersAsync(new OrderQueryParams(null, null, null, null, null, null, null, null));
        await orderService.GetStatsAsync();
        await orderService.GetAnomaliesAsync();
    }
}