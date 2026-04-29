namespace backend.Models.DTOs.Orders;

public record AnomalyDto(string OrderId, List<string> AnomalyTypes, string Severity);
public record AnomalyResponse(List<AnomalyDto> Data, int Total, int Limit, int Offset);
