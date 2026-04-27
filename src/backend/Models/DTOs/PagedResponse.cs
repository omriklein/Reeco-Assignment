namespace backend.Models.DTOs;

public record PagedResponse<T>(IEnumerable<T> Data, int Total, int Limit, int Offset);
