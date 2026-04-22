using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly IProductFeatureRepository _productFeatureRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserAccessor _currentUser;
    private readonly IImageStorageService _imageStorage;

    public ProductService(
        IProductRepository productRepository,
        IProductFeatureRepository productFeatureRepository,
        IUserRepository userRepository,
        ICurrentUserAccessor currentUser,
        IImageStorageService imageStorage)
    {
        _productRepository = productRepository;
        _productFeatureRepository = productFeatureRepository;
        _userRepository = userRepository;
        _currentUser = currentUser;
        _imageStorage = imageStorage;
    }

    public async Task<PagedResult<ProductResponseDto>> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var filter = new ProductListFilter { Page = page, PageSize = pageSize };
        return await SearchProductAsync(filter, cancellationToken);
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetActiveByIdAsync(id, cancellationToken);
        if (product is null)
            return null;

        var dtoList = new List<ProductResponseDto> { MapToResponseDto(product) };
        await AuditDtoEnricher.EnrichAsync(dtoList, _userRepository, cancellationToken);

        return dtoList[0];
    }

    public async Task<ProductMutationResult> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken = default)
    {
        var categoryExists = await _productRepository.CategoryExistsActiveAsync(dto.CategoryId, cancellationToken);
        if (!categoryExists)
            return new ProductMutationResult(null, ProductMutationError.InvalidCategory);

        var sku = NormalizeSku(dto.Sku);
        if (await _productRepository.IsSkuTakenAsync(sku, excludeProductId: null, cancellationToken))
            return new ProductMutationResult(null, ProductMutationError.DuplicateSku);

        var normalizedBarcode = NormalizeBarcode(dto.Barcode);

        if (normalizedBarcode is not null
            && await _productRepository.IsBarcodeTakenAsync(normalizedBarcode, excludeProductId: null, cancellationToken))
            return new ProductMutationResult(null, ProductMutationError.DuplicateBarcode);

        var actor = await _currentUser.GetActorNameAsync(cancellationToken);
        var product = new Product
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Sku = sku,
            Barcode = normalizedBarcode,
            Price = dto.Price,
            OriginalPrice = dto.IsDiscount ? dto.OriginalPrice : null,
            IsDiscount = dto.IsDiscount,
            Stock = dto.Stock,
            Status = dto.Status,
            ImageUrl = dto.ImageUrl,
            IsDeleted = false,
            CreatedByUserId = _currentUser.UserId,
            CreatedBy = actor,
            CreatedAt = DateTime.UtcNow,
            UpdatedByUserId = null,
            UpdatedBy = null,
            UpdatedAt = null
        };

        await _productRepository.AddAsync(product, cancellationToken);
        await _productRepository.SaveChangesAsync(cancellationToken);

        return new ProductMutationResult(MapToResponseDto(product), ProductMutationError.None);
    }

    public async Task<ProductMutationResult> UpdateAsync(int id, UpdateProductDto dto, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (product is null)
            return new ProductMutationResult(null, ProductMutationError.NotFound);

        if (dto.CategoryId != product.CategoryId)
        {
            var ok = await _productRepository.CategoryExistsActiveAsync(dto.CategoryId, cancellationToken);
            if (!ok)
                return new ProductMutationResult(null, ProductMutationError.InvalidCategory);
        }

        var sku = NormalizeSku(dto.Sku);
        if (sku != product.Sku
            && await _productRepository.IsSkuTakenAsync(sku, excludeProductId: id, cancellationToken))
            return new ProductMutationResult(null, ProductMutationError.DuplicateSku);

        var normalizedBarcode = NormalizeBarcode(dto.Barcode);
        if (normalizedBarcode != product.Barcode
            && normalizedBarcode is not null
            && await _productRepository.IsBarcodeTakenAsync(normalizedBarcode, excludeProductId: id, cancellationToken))
            return new ProductMutationResult(null, ProductMutationError.DuplicateBarcode);

        var previousImage = product.ImageUrl;

        product.CategoryId = dto.CategoryId;
        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Sku = sku;
        product.Barcode = normalizedBarcode;
        product.Price = dto.Price;
        product.OriginalPrice = dto.IsDiscount ? dto.OriginalPrice : null;
        product.IsDiscount = dto.IsDiscount;
        product.Stock = dto.Stock;
        product.Status = dto.Status;
        product.ImageUrl = dto.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedByUserId = _currentUser.UserId;
        product.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);

        await _productRepository.SaveChangesAsync(cancellationToken);

        // Görsel değiştiyse eski dosya (local upload ise) temizlenir.
        if (!string.Equals(previousImage, product.ImageUrl, StringComparison.Ordinal))
        {
            await _imageStorage.DeleteIfLocalAsync(previousImage, cancellationToken);
        }

        return new ProductMutationResult(MapToResponseDto(product), ProductMutationError.None);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (product is null)
            return true;

        var imageToRemove = product.ImageUrl;

        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedByUserId = _currentUser.UserId;
        product.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);

        await _productRepository.SaveChangesAsync(cancellationToken);

        // Ürün silindiğinde local olarak yüklenmiş görsel de disk'ten kaldırılır.
        await _imageStorage.DeleteIfLocalAsync(imageToRemove, cancellationToken);

        return true;
    }

    public async Task<PagedResult<ProductResponseDto>> SearchProductAsync(ProductListFilter f, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _productRepository.SearchAsync(f, cancellationToken);

        var page = Math.Max(1, f.Page);
        var size = Math.Clamp(f.PageSize, 1, 100);

        var list = items.Select(MapToResponseDto).ToList();
        // CategoryName artık Include(p => p.Category) JOIN'inden geliyor;
        // ayrı sorguya gerek yok.
        await AuditDtoEnricher.EnrichProductsAsync(list, _userRepository, cancellationToken);

        return new PagedResult<ProductResponseDto>
        {
            Items = list,
            TotalCount = total,
            Page = page,
            PageSize = size,
        };
    }


    private static ProductResponseDto MapToResponseDto(Product product) => new()
    {
        ProductId = product.ProductId,
        CategoryId = product.CategoryId,
        CategoryName = product.Category?.Name,
        Name = product.Name,
        Description = product.Description,
        Sku = product.Sku,
        Barcode = product.Barcode,
        Price = product.Price,
        OriginalPrice = product.OriginalPrice,
        IsDiscount = product.IsDiscount,
        Stock = product.Stock,
        ImageUrl = product.ImageUrl,
        Status = product.Status,
        IsDeleted = product.IsDeleted,
        CreatedByUserId = product.CreatedByUserId,
        CreatedBy = product.CreatedBy,
        CreatedAt = product.CreatedAt,
        UpdatedByUserId = product.UpdatedByUserId,
        UpdatedBy = product.UpdatedBy,
        UpdatedAt = product.UpdatedAt,
        Features = product.ProductFeatures?.Select(pf => new ProductFeatureResponseDto(pf)).ToList() ?? new List<ProductFeatureResponseDto>()
    };

    private static string NormalizeSku(string value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToUpperInvariant();

    private static string? NormalizeBarcode(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }
}
