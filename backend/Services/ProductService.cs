using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;

    public ProductService(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<PagedResult<ProductResponseDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var filter = new ProductListFilter { Page = page, PageSize = pageSize };
        return await SearchProductAsync(filter, cancellationToken);
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetActiveByIdAsync(id, cancellationToken);
        if (product == null)
            return null;

        return MapToResponseDto(product);
    }

    public async Task<ProductResponseDto?> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _productRepository.CategoryExistsActiveAsync(dto.CategoryId, cancellationToken);
        if (!categoryExists)
            return null;

        var normalizedBarcode = NormalizeBarcode(dto.Barcode);

        if (normalizedBarcode is not null
            && await _productRepository.IsBarcodeTakenAsync(normalizedBarcode, excludeProductId: null, cancellationToken))
        {
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

        await _productRepository.AddAsync(product, cancellationToken);
        await _productRepository.SaveChangesAsync(cancellationToken);

        product.Sku = $"PRD-{product.ProductId:D7}";
        await _productRepository.SaveChangesAsync(cancellationToken);

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

    public async Task<ProductResponseDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (product is null)
            return null;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.ImageUrl = dto.ImageUrl;
        product.Status = dto.Status;

        await _productRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (product is null)
            return true;

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = "System";

        await _productRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PagedResult<ProductResponseDto>> SearchProductAsync(ProductListFilter f, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _productRepository.SearchAsync(f, cancellationToken);

        var page = Math.Max(1, f.Page);
        var size = Math.Clamp(f.PageSize, 1, 100);

        return new PagedResult<ProductResponseDto>
        {
            Items = items.Select(MapToResponseDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = size,
        };
    }

    private static ProductResponseDto MapToResponseDto(Product product) => new()
    {
        ProductId = product.ProductId,
        CategoryId = product.CategoryId,
        Name = product.Name,
        Description = product.Description,
        Sku = product.Sku,
        Barcode = product.Barcode,
        Price = product.Price,
        OriginalPrice = product.OriginalPrice,
        IsDiscount = product.IsDiscount,
        Stock = product.Stock,
        Status = product.Status,
        ImageUrl = product.ImageUrl,
        IsDeleted = product.IsDeleted,
        CreatedBy = product.CreatedBy,
        CreatedAt = product.CreatedAt,
        UpdatedBy = product.UpdatedBy,
        UpdatedAt = product.UpdatedAt,
    };

    private static string? NormalizeBarcode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }
}
