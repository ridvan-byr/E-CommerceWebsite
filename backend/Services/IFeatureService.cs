using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IFeatureService
    {
        Task<IReadOnlyList<FeatureResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<FeatureResponseDto?> GetByIdAsync(int id,CancellationToken cancellationToken= default);
        Task<FeatureResponseDto?> CreateAsync(CreateFeatureDto dto,CancellationToken cancellationToken = default);
        Task<FeatureResponseDto?> UpdateAsync(int id,UpdateFeatureDto dto,CancellationToken cancellationToken = default);
        Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    }
}