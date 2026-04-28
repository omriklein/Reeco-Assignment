using backend.Models.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController(IBulkJobService bulkJobService) : ControllerBase
{
    [HttpGet("{id}")]
    public IActionResult GetJob(string id)
    {
        var job = bulkJobService.GetJob(id);
        if (job is null)
            return NotFound(new { error = "Job not found", code = "JOB_NOT_FOUND" });

        var dto = new JobStatusDto(
            job.Status,
            new JobProgressDto(job.Total, job.Completed, job.Failed)
        );
        return Ok(dto);
    }
}