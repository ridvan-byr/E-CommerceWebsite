using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers;


[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{

    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProductList([FromQuery] int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var list = await _productService.GetAllAsync(page, pageSize, cancellationToken);
        return Ok(list);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchProduct([FromQuery] ProductListFilter filter, CancellationToken cancellationToken = default)
    {
        var result = await _productService.SearchProductAsync(filter, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id, CancellationToken cancellationToken = default)
    {
            var product = await _productService.GetByIdAsync(id, cancellationToken);
            if (product is null)
            {
                return NotFound();
            }
            return Ok(product);
    }


    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }


        var result = await _productService.CreateAsync(dto, cancellationToken);
        if (result.Error != ProductMutationError.None)
        {
            if (result.Error == ProductMutationError.NotFound)
                return NotFound();
            var message = result.Error switch
            {
                ProductMutationError.DuplicateSku => "Bu stok kodu (SKU) başka bir aktif üründe kullanılıyor.",
                ProductMutationError.DuplicateBarcode => "Bu barkod başka bir aktif üründe kullanılıyor.",
                ProductMutationError.InvalidCategory => "Kategori bulunamadı veya silinmiş.",
                _ => "Ürün oluşturulamadı."
            };
            return BadRequest(new { message });
        }

        return CreatedAtAction(nameof(GetProduct), new { id = result.Product!.ProductId }, result.Product);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existing = await _productService.GetByIdAsync(id, cancellationToken);
        if (existing is null)
            return NotFound();

        var result = await _productService.UpdateAsync(id, dto, cancellationToken);
        if (result.Error != ProductMutationError.None)
        {
            if (result.Error == ProductMutationError.NotFound)
                return NotFound();
            var message = result.Error switch
            {
                ProductMutationError.DuplicateSku => "Bu stok kodu (SKU) başka bir aktif üründe kullanılıyor.",
                ProductMutationError.DuplicateBarcode => "Bu barkod başka bir aktif üründe kullanılıyor.",
                ProductMutationError.InvalidCategory => "Kategori bulunamadı veya silinmiş.",
                _ => "Güncelleme reddedildi."
            };
            return BadRequest(new { message });
        }

        return Ok(result.Product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken = default)
    {
        var deleted = await _productService.SoftDeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }
}