using System.Text.Json.Serialization;

namespace backend.Models.DTOs;

public record BulkActionRequest(
    [property: JsonPropertyName("orderIds")] List<string> OrderIds,
    string Action,
    string? Reason = null
);

public record BulkActionResponse(
    [property: JsonPropertyName("jobId")] string JobId
);

public record JobProgressDto(int Total, int Completed, int Failed);

public record JobStatusDto(string Status, JobProgressDto Progress);