namespace backend.Models.DTOs.Orders;

public record StatusStats(int Count, decimal TotalValue);

public record MonthStats(string Month, int OrderCount, decimal Revenue);

public record SupplierRevenueStats(string SupplierId, string SupplierName, decimal TotalRevenue);

public record WarehouseStats(string Warehouse, int Count, decimal TotalValue);

public record OrderStatsDto(
    int TotalOrders,
    decimal TotalRevenue,
    Dictionary<string, StatusStats> ByStatus,
    List<MonthStats> ByMonth,
    List<SupplierRevenueStats> TopSuppliers,
    List<WarehouseStats> ByWarehouse
);
