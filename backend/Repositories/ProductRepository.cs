using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly DataContext _context;

    public ProductRepository(DataContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProductResponseDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
    var filter = new ProductListFilter { Page = page, PageSize = pageSize };
    return await SearchProductAsync(filter, cancellationToken);
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {

        return await _context.Products
        .AsNoTracking()
        .Where(c => c.ProductId == id && !c.IsDeleted)
        .Select(c => new ProductResponseDto
        {
            ProductId = c.ProductId,
            CategoryId = c.CategoryId,
            Name = c.Name,
            Description = c.Description,
            Sku = c.Sku,
            Barcode = c.Barcode,
            Price = c.Price,
            OriginalPrice = c.OriginalPrice,
            IsDiscount = c.IsDiscount,
            Stock = c.Stock,
            Status = c.Status,
            ImageUrl = c.ImageUrl,
            IsDeleted = c.IsDeleted,
            CreatedBy = c.CreatedBy,
            CreatedAt = c.CreatedAt,
            UpdatedBy = c.UpdatedBy,
            UpdatedAt = c.UpdatedAt
        }).FirstOrDefaultAsync(cancellationToken);
        
    }
    
    public async Task<ProductResponseDto?> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _context.Categories.AsNoTracking()
            .AnyAsync(c => c.CategoryId == dto.CategoryId && !c.IsDeleted, cancellationToken);
        if (!categoryExists)
        {
            return null;
        }
        
        var normalizedBarcode = NormalizeBarcode(dto.Barcode);

        if(normalizedBarcode is not null)
        {
            var barcodeTaken = await _context.Products
            .AsNoTracking()
            .AnyAsync(p => p.Barcode == normalizedBarcode,cancellationToken);
            if(barcodeTaken)
              return null;
        }

         var product = new Product
         {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Sku = "TMP-" + Guid.NewGuid().ToString("N"),
            Barcode = normalizedBarcode,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            IsDiscount = dto.IsDiscount,
            Stock = dto.Stock,
            Status = dto.Status,
            ImageUrl = dto.ImageUrl,
            IsDeleted = false,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow,
            UpdatedBy = null,
            UpdatedAt = null
         };

         _context.Products.Add(product);
         await _context.SaveChangesAsync(cancellationToken);
         
         product.Sku = $"PRD-{product.ProductId:D7}";
         await _context.SaveChangesAsync(cancellationToken);
         return new ProductResponseDto
         {
            ProductId = product.ProductId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Sku = product.Sku,
            Barcode = product.Barcode,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            IsDiscount = dto.IsDiscount,
            Stock = dto.Stock,
            Status = dto.Status,
            ImageUrl = dto.ImageUrl
         };
    }

    public async Task<ProductResponseDto?> UpdateAsync(int id,UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);

        if(product is null || product.IsDeleted)
        {
            return null;
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.ImageUrl = dto.ImageUrl;
        
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);

    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var products = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        
        if(products is null || products.IsDeleted)
        {
            return true;
        }
        products.IsDeleted = true;
        products.UpdatedAt = DateTime.UtcNow;
        products.UpdatedBy = "System";
         
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PagedResult<ProductResponseDto>> SearchProductAsync(ProductListFilter f, CancellationToken cancellationToken = default)
    {
        var query = _context.Products
        .AsNoTracking()
        .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var s = f.Search.Trim();

            query = query.Where(p =>
                p.Name.Contains(s) ||
                (p.Sku != null && p.Sku.Contains(s)) ||
                (p.Barcode != null && p.Barcode.Contains(s)) ||
                (p.Description != null && p.Description.Contains(s)));

        }

        if(f.CategoryId is int cid)
            {
                query = query.Where(p => p.CategoryId == cid);
            }

        if (!string.IsNullOrWhiteSpace(f.Status))
        {
            query = query.Where(p => p.Status == f.Status);
        }

        if(f.MinPrice is decimal minP)
        {
            query = query.Where(p => p.Price >= minP);
        }

        if(f.MaxPrice is decimal maxP)
        {
            query = query.Where(p => p.Price <= maxP);
        }

        if(f.MinStock is int minS)
        {
            query = query.Where(p => p.Stock >= minS);
        }
        

        var total = await query.CountAsync(cancellationToken);

        var page = Math.Max(1,f.Page);
        var size = Math.Clamp(f.PageSize,1,100);
        
        var items = await query
        .OrderBy(p => p.Name)
        .Skip((page - 1) * size)
        .Take(size)
        .Select(p => new ProductResponseDto
        {
            ProductId = p.ProductId,
            CategoryId = p.CategoryId,
            Name = p.Name,
            Description = p.Description,
            Sku = p.Sku,
            Barcode = p.Barcode,
            Price = p.Price,
            OriginalPrice = p.OriginalPrice,
            IsDiscount = p.IsDiscount,
            Stock = p.Stock,
            Status = p.Status,
            ImageUrl = p.ImageUrl,
            IsDeleted = p.IsDeleted,
            CreatedBy = p.CreatedBy,
            CreatedAt = p.CreatedAt,
            UpdatedBy = p.UpdatedBy,
            UpdatedAt = p.UpdatedAt,
        })
        .ToListAsync(cancellationToken);
        
        return new PagedResult<ProductResponseDto>
        {
        Items = items,
        TotalCount = total,
        Page = page,
        PageSize = size,
        };

    }
    
    private static string? NormalizeBarcode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

}

