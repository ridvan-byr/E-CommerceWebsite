using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers;

// REVIEW [A2] Bu controller da [Authorize] olmadan açık. Yazma uçlarına
// (POST/PUT/DELETE) auth gerekiyor. Ayrıntılı tartışma için
// ProductController.cs üstündeki A2/A4 review yorumuna bak.
[ApiController]
[Route("api/categories")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategoryList(CancellationToken cancellationToken = default)
    {
        var list = await _categoryService.GetAllAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetCategory(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryService.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _categoryService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetCategory), new { id = result.CategoryId }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _categoryService.UpdateAsync(id, dto, cancellationToken);
        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _categoryService.SoftDeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return Ok(new { message = "Kategori silindi.", id });
    }
}
