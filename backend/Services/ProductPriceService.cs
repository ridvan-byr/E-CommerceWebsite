using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class ProductPriceService : IProductPriceService
{
    private readonly IProductPriceRepository _productPriceRepository;
    private readonly IProductRepository _productRepository;

    public ProductPriceService(
        IProductPriceRepository productPriceRepository,
        IProductRepository productRepository)
    {
        _productPriceRepository = productPriceRepository;
        _productRepository = productRepository;
    }

    public async Task<IReadOnlyList<ProductPriceResponseDto>> GetHistoryAsync(
        int productId,
        CancellationToken cancellationToken = default)
    {
        var rows = await _productPriceRepository.GetHistoryByProductIdAsync(
            productId,
            cancellationToken);

        return rows.Select(MapToResponseDto).ToList();
    }

    public async Task<ProductPriceResponseDto?> AddAsync(
        int productId,
        CreateProductPriceDto dto,
        CancellationToken cancellationToken = default)
    {
        var product = await _productRepository.GetActiveByIdAsync(productId, cancellationToken);
        if (product is null)
            return null;

        var entity = new ProductPrice
        {
            ProductId = productId,
            Price = dto.Price,
            OriginalPrice = dto.IsDiscount ? dto.OriginalPrice : null,
            IsDiscount = dto.IsDiscount,
            CreatedAt = System.DateTime.UtcNow,
            CreatedBy = "System",
        };

        await _productPriceRepository.AddAsync(entity, cancellationToken);
        await _productPriceRepository.SaveChangesAsync(cancellationToken);

        return MapToResponseDto(entity);
    }

    private static ProductPriceResponseDto MapToResponseDto(ProductPrice p) => new()
    {
        ProductPriceId = p.ProductPriceId,
        ProductId = p.ProductId,
        Price = p.Price,
        OriginalPrice = p.OriginalPrice,
        IsDiscount = p.IsDiscount,
        CreatedBy = p.CreatedBy,
        CreatedAt = p.CreatedAt,
    };
}
