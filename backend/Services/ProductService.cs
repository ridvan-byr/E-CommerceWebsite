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

        var dto = MapToResponseDto(product);
        dto.CategoryName = await _productRepository.GetCategoryNameAsync(product.CategoryId, cancellationToken);
        return dto;
    }

    public async Task<ProductResponseDto?> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _productRepository.CategoryExistsActiveAsync(dto.CategoryId, cancellationToken);
        if (!categoryExists)
            return null;

        var normalizedBarcode = NormalizeBarcode(dto.Barcode);

        if (normalizedBarcode is not null
            && await _productRepository.IsBarcodeTakenAsync(normalizedBarcode, excludeProductId: null, cancellationToken))
            return null;

        var product = new Product
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Sku = "TMP-" + Guid.NewGuid().ToString("N"),
            Barcode = normalizedBarcode,
            Price = dto.Price,
            OriginalPrice = dto.IsDiscount ? dto.OriginalPrice : null,
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

        var categoryName = await _productRepository.GetCategoryNameAsync(product.CategoryId, cancellationToken);

        return new ProductResponseDto
        {
            ProductId = product.ProductId,
            CategoryId = dto.CategoryId,
            CategoryName = categoryName,
            Name = dto.Name,
            Description = dto.Description,
            Sku = product.Sku,
            Barcode = product.Barcode,
            Price = product.Price,
            OriginalPrice = product.OriginalPrice,
            IsDiscount = product.IsDiscount,
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

        if (dto.CategoryId != product.CategoryId)
        {
            var ok = await _productRepository.CategoryExistsActiveAsync(dto.CategoryId, cancellationToken);
            if (!ok)
                return null;
        }

        var normalizedBarcode = NormalizeBarcode(dto.Barcode);
        if (normalizedBarcode != product.Barcode
            && normalizedBarcode is not null
            && await _productRepository.IsBarcodeTakenAsync(normalizedBarcode, excludeProductId: id, cancellationToken))
            return null;

        product.CategoryId = dto.CategoryId;
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Barcode = normalizedBarcode;
        product.Price = dto.Price;
        product.OriginalPrice = dto.IsDiscount ? dto.OriginalPrice : null;
        product.IsDiscount = dto.IsDiscount;
        product.Stock = dto.Stock;
        product.Status = dto.Status;
        product.ImageUrl = dto.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = "System";

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

        var list = items.Select(MapToResponseDto).ToList();
        await EnrichCategoryNamesAsync(list, cancellationToken);

        return new PagedResult<ProductResponseDto>
        {
            Items = list,
            TotalCount = total,
            Page = page,
            PageSize = size,
        };
    }

    private async Task EnrichCategoryNamesAsync(List<ProductResponseDto> items, CancellationToken cancellationToken)
    {
        if (items.Count == 0)
            return;

        var map = await _productRepository.GetCategoryNamesByIdsAsync(
            items.Select(i => i.CategoryId),
            cancellationToken);

        foreach (var i in items)
        {
            if (map.TryGetValue(i.CategoryId, out var name))
                i.CategoryName = name;
        }
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
