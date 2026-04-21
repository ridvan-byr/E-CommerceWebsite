using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class FeatureService : IFeatureService
{
    private readonly IFeatureRepository _featureRepository;
    private readonly ICurrentUserAccessor _currentUser;

    public FeatureService(IFeatureRepository featureRepository, ICurrentUserAccessor currentUser)
    {
        _featureRepository = featureRepository;
        _currentUser = currentUser;
    }

    public async Task<FeatureResponseDto?> CreateAsync(CreateFeatureDto dto, CancellationToken cancellationToken = default)
    {
        var actor = await _currentUser.GetActorNameAsync(cancellationToken);
        var feature = new Feature
        {
            Name = dto.Name,
            IsDeleted = false,
            CreatedByUserId = _currentUser.UserId,
            CreatedBy = actor,
            CreatedAt = DateTime.UtcNow,
        };

        await _featureRepository.AddAsync(feature, cancellationToken);
        await _featureRepository.SaveChangesAsync(cancellationToken);

        return new FeatureResponseDto(feature);
    }

    public async Task<IReadOnlyList<FeatureResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var features = await _featureRepository.GetAllActiveAsync(cancellationToken);
        return features.Select(f => new FeatureResponseDto(f)).ToList();
    }

    public async Task<FeatureResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var feature = await _featureRepository.GetFeatureByIdAsync(id, cancellationToken);
        return feature is null ? null : new FeatureResponseDto(feature);
    }

    public async Task<FeatureResponseDto?> UpdateAsync(int id, UpdateFeatureDto dto, CancellationToken cancellationToken = default)
    {
        var feature = await _featureRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (feature is null)
            return null;

        feature.Name = dto.Name;
        feature.UpdatedAt = DateTime.UtcNow;
        feature.UpdatedByUserId = _currentUser.UserId;
        feature.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);

        await _featureRepository.SaveChangesAsync(cancellationToken);

        return new FeatureResponseDto(feature);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var feature = await _featureRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (feature is null)
            return false;

        feature.IsDeleted = true;
        feature.UpdatedAt = DateTime.UtcNow;
        feature.UpdatedByUserId = _currentUser.UserId;
        feature.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);

        await _featureRepository.SaveChangesAsync(cancellationToken);
        return true;
    }
}
