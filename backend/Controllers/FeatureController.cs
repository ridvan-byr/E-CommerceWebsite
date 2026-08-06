using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

// REVIEW [A2] Bu controller da [Authorize] olmadan açık. Ayrıntılı tartışma
// için ProductController.cs üstündeki A2/A4 review yorumuna bak.
[ApiController]
[Route("api/features")]
public class FeatureController : ControllerBase
{
    private readonly IFeatureService _featureService;

    public FeatureController(IFeatureService featureService)
    {
        _featureService = featureService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllFeatures(CancellationToken cancellationToken = default)
    {
        var items = await _featureService.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetFeature(int id, CancellationToken cancellationToken = default)
    {
        var item = await _featureService.GetByIdAsync(id, cancellationToken);
        if (item is null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFeature([FromBody] CreateFeatureDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _featureService.CreateAsync(dto, cancellationToken);
        if (created is null)
            return BadRequest();

        return CreatedAtAction(nameof(GetFeature), new { id = created.FeatureId }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateFeature(int id,[FromBody] UpdateFeatureDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var result = await _featureService.UpdateAsync(id,dto,cancellationToken);

        if(result is null)
           return NotFound();

        return Ok(result);
        
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFeature(int id, CancellationToken cancellationToken = default)
    {
    
        var deleted = await _featureService.SoftDeleteAsync(id,cancellationToken);

        if(!deleted)
           return NotFound();

        return Ok(new { message = "Özellik silindi.", id });
        
    }
}
