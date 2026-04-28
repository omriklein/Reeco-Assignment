namespace backend.Models.DTOs.Suppliers;

public record MonthlyTrendEntry(string Month, int OrderCount, decimal Revenue, decimal AvgDeliveryDays);

public record SupplierPerformanceDto(
    double AvgDeliveryDays,
    double RejectionRate,
    double PriceConsistency,
    List<MonthlyTrendEntry> MonthlyTrend
);
