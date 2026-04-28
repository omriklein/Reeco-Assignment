namespace backend.Models;

public class BulkJobState
{
    public string Id      { get; init; } = string.Empty;
    public string Status  { get; set;  } = Enums.JobStatus.Processing;
    public int    Total   { get; set;  }
    public int    Completed { get; set; }
    public int    Failed  { get; set;  }
}