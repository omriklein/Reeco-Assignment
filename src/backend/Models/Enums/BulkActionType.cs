namespace backend.Models.Enums;

public static class BulkActionType
{
    public const string Approve = "approve";
    public const string Reject  = "reject";
    public const string Flag    = "flag";

    public static readonly HashSet<string> All = [Approve, Reject, Flag];

    public static string? ToOrderStatus(string action) => action switch
    {
        Approve => OrderStatus.Approved,
        Reject  => OrderStatus.Rejected,
        _       => null
    };
}