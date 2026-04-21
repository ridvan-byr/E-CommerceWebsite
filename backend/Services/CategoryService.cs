using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserAccessor _currentUser;

    public CategoryService(
        ICategoryRepository categoryRepository,
        IUserRepository userRepository,
        ICurrentUserAccessor currentUser)
    {
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAllActiveWithNonDeletedProductsAsync(cancellationToken);
        var list = categories.Select(MapToDto).ToList();
        await AuditDtoEnricher.EnrichCategoriesAsync(list, _userRepository, cancellationToken);
        return list;
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetActiveByIdWithNonDeletedProductsAsync(id, cancellationToken);
        if (category is null)
            return null;
        var dto = MapToDto(category);
        await AuditDtoEnricher.EnrichCategoriesAsync(new List<CategoryResponseDto> { dto }, _userRepository, cancellationToken);
        return dto;
    }

    public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var actor = await _currentUser.GetActorNameAsync(cancellationToken);
        var category = new Category
        {
            Name = dto.Name,
            CreatedByUserId = _currentUser.UserId,
            CreatedBy = actor,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            UpdatedAt = null,
            UpdatedByUserId = null,
            UpdatedBy = null,
        };

        await _categoryRepository.AddAsync(category, cancellationToken);
        await _categoryRepository.SaveChangesAsync(cancellationToken);

        var created = new CategoryResponseDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            ProductCount = 0,
            IsDeleted = category.IsDeleted,
            CreatedByUserId = category.CreatedByUserId,
            CreatedBy = category.CreatedBy,
            CreatedAt = category.CreatedAt,
            UpdatedByUserId = category.UpdatedByUserId,
            UpdatedBy = category.UpdatedBy,
            UpdatedAt = category.UpdatedAt,
        };
        await AuditDtoEnricher.EnrichCategoriesAsync(new List<CategoryResponseDto> { created }, _userRepository, cancellationToken);
        return created;
    }

    public async Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (category is null)
            return null;

        category.Name = dto.Name;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedByUserId = _currentUser.UserId;
        category.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);

        await _categoryRepository.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (category is null)
            return false;

        category.IsDeleted = true;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedByUserId = _currentUser.UserId;
        category.UpdatedBy = await _currentUser.GetActorNameAsync(cancellationToken);
        await _categoryRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CategoryResponseDto MapToDto(Category c) => new()
    {
        CategoryId = c.CategoryId,
        Name = c.Name,
        ProductCount = c.Products.Count,
        IsDeleted = c.IsDeleted,
        CreatedByUserId = c.CreatedByUserId,
        CreatedBy = c.CreatedBy,
        CreatedAt = c.CreatedAt,
        UpdatedByUserId = c.UpdatedByUserId,
        UpdatedBy = c.UpdatedBy,
        UpdatedAt = c.UpdatedAt,
    };
}
