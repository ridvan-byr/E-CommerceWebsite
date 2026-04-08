using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/products/{productId:int}/features")]
public class ProductFeatureController : ControllerBase
{
    private readonly IProductFeatureService _productFeatureService;

    public ProductFeatureController(IProductFeatureService productFeatureService)
    {
        _productFeatureService = productFeatureService;
    }

    [HttpGet]
    public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken = default)
    {
        var items = await _productFeatureService.GetByProductIdAsync(productId, cancellationToken);
        if (items is null)
            return NotFound();
        return Ok(items);
    }

    [HttpGet("{productFeatureId:int}")]
    public async Task<IActionResult> GetById(int productId, int productFeatureId, CancellationToken cancellationToken = default)
    {
        var item = await _productFeatureService.GetByIdAsync(productId, productFeatureId, cancellationToken);
        if (item is null)
            return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int productId, [FromBody] CreateProductFeatureDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var created = await _productFeatureService.CreateAsync(productId, dto, cancellationToken);
        if (created is null)
            return BadRequest(new { message = "Ürün veya özellik bulunamadı veya bu özellik ürüne zaten eklenmiş." });

        return CreatedAtAction(nameof(GetById), new { productId, productFeatureId = created.ProductFeatureId }, created);
    }

    [HttpPut("{productFeatureId:int}")]
    public async Task<IActionResult> Update(int productId, int productFeatureId, [FromBody] UpdateProductFeatureDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _productFeatureService.UpdateAsync(productId, productFeatureId, dto, cancellationToken);
        if (updated is null)
            return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{productFeatureId:int}")]
    public async Task<IActionResult> Delete(int productId, int productFeatureId, CancellationToken cancellationToken = default)
    {
        var deleted = await _productFeatureService.DeleteAsync(productId, productFeatureId, cancellationToken);
        if (!deleted)
            return NotFound();
        return NoContent();
    }
}
