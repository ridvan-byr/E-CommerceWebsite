using System.Threading;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/products")]
public class ProductPriceController : ControllerBase
{
    private readonly IProductPriceService _productPriceService;

    public ProductPriceController(IProductPriceService productPriceService)
    {
        _productPriceService = productPriceService;
    }

    [HttpGet("{id:int}/prices")]
    public async Task<IActionResult> GetHistory(int id, CancellationToken cancellationToken = default)
    {
        var items = await _productPriceService.GetHistoryAsync(id, cancellationToken);
        return Ok(items);
    }

    [HttpPost("{id:int}/prices")]
    public async Task<IActionResult> AddPrice(
        int id,
        [FromBody] CreateProductPriceDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _productPriceService.AddAsync(id, dto, cancellationToken);
        if (result is null)
            return NotFound();

        return CreatedAtAction(nameof(GetHistory), new { id }, result);
    }
}
