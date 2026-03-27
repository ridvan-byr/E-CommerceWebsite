using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers;


[ApiController]
[Route("api/products")]
public class ProductController : ControllerBase
{

    private readonly DataContext _context;

    public ProductController(DataContext context)
    {
        _context = context;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        return Ok(product);
    }


    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Sku = dto.Sku,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            IsDiscount = dto.IsDiscount,
            Stock = dto.Stock,
            Status = dto.Status,
            ImageUrl = dto.ImageUrl,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow,
            UpdatedBy = null,
            UpdatedAt = null
        };

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
    }
}