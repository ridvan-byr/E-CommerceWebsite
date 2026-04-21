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
    private readonly IImageStorageService _imageStorage;

    public ProductController(IProductService productService, IImageStorageService imageStorage)
    {
        _productService = productService;
        _imageStorage = imageStorage;
    }

    /// <summary>
    /// Ürün görseli yükler. multipart/form-data — alan adı: "file".
    /// Maksimum boyut: 5 MB. Desteklenen formatlar: JPG, PNG, WEBP, GIF.
    /// Dönen URL doğrudan imageUrl alanında kullanılabilir.
    /// </summary>
    [HttpPost("upload-image")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(
        IFormFile file,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "Dosya seçilmedi." });

        try
        {
            var url = await _imageStorage.SaveProductImageAsync(file, cancellationToken);
            return Ok(new { url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
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