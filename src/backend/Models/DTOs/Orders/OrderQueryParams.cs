using backend.Models.Enums;

namespace backend.Models.DTOs.Orders;

public record OrderQueryParams(
    string? Status,
    string? Priority,
    string? SupplierId,
    string? Warehouse,
    DateOnly? DateFrom,
    DateOnly? DateTo,
    decimal? MinTotal,
    string? Search,
    SortField SortField = SortField.Id,
    SortDirection SortDirection = SortDirection.Asc,
    int Limit = 20,
    int Offset = 0
);
