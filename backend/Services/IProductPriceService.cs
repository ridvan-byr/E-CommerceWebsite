using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services;

public interface IProductPriceService
{
    Task<IReadOnlyList<ProductPriceResponseDto>> GetHistoryAsync(
        int productId,
        CancellationToken cancellationToken = default);

    Task<ProductPriceResponseDto?> AddAsync(
        int productId,
        CreateProductPriceDto dto,
        CancellationToken cancellationToken = default);
}
