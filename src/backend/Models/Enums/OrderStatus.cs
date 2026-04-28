namespace backend.Models.Enums;

public static class OrderStatus
{
    public const string Pending = "pending";
    public const string Approved = "approved";
    public const string Rejected = "rejected";
    public const string Shipped = "shipped";
    public const string Delivered = "delivered";
    public const string Cancelled = "cancelled";

    public static readonly HashSet<string> All =
    [
        Pending, Approved, Rejected, Shipped, Delivered, Cancelled
    ];
}
