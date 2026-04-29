using backend.Models.DTOs;
using backend.Models.DTOs.Orders;

namespace backend.Services;

public interface IOrderService
{
    Task<PagedResponse<OrderListDto>> GetOrdersAsync(OrderQueryParams queryParams);
    Task<OrderDetailDto?> GetOrderByIdAsync(string id);
    Task<(OrderDetailDto? order, string? error, int statusCode)> UpdateOrderAsync(string id, UpdateOrderRequest request);
    Task<OrderStatsDto> GetStatsAsync();
    Task<AnomalyResponse> GetAnomaliesAsync(AnomalyQueryParams queryParams);
}
