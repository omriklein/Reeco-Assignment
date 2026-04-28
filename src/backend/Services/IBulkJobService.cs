using backend.Models;

namespace backend.Services;

public interface IBulkJobService
{
    string CreateJob(List<string> orderIds, string action);
    BulkJobState? GetJob(string jobId);
}