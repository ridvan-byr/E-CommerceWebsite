using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default);
        Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default);
        Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}