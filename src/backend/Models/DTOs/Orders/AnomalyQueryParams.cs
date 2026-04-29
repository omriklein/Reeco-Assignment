namespace backend.Models.DTOs.Orders;

public record AnomalyQueryParams(
    string? Severity = null,
    string? AnomalyType = null,
    int Limit = 0,
    int Offset = 0
);
