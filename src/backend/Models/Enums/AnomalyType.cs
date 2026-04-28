namespace backend.Models.Enums;

public static class AnomalyType
{
    public const string PriceMismatch    = "price_mismatch";
    public const string InactiveSupplier = "inactive_supplier";
    public const string NegativeQuantity = "negative_quantity";
    public const string TimestampAnomaly = "timestamp_anomaly";
    public const string PriceSpike       = "price_spike";
    public const string AfterHours       = "after_hours";
    public const string RiskySupplier    = "risky_supplier";
}

public static class AnomalySeverity
{
    public const string Low    = "low";
    public const string Medium = "medium";
    public const string High   = "high";
}

public static class AnomalyThresholds
{
    public const decimal PriceMismatchTolerance = 0.01m;
    public const decimal PriceSpikeMultiplier   = 3m;
    public const int     AfterHoursStart        = 22;
    public const int     AfterHoursEnd          = 6;
    public const double  RiskySupplierRate      = 0.5;
}
