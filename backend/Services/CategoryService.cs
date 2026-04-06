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

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryRepository.GetAllActiveWithNonDeletedProductsAsync(cancellationToken);
        return categories.Select(MapToDto).ToList();
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetActiveByIdWithNonDeletedProductsAsync(id, cancellationToken);
        return category is null ? null : MapToDto(category);
    }

    public async Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false,
            UpdatedAt = null,
            UpdatedBy = null,
        };

        await _categoryRepository.AddAsync(category, cancellationToken);
        await _categoryRepository.SaveChangesAsync(cancellationToken);

        return new CategoryResponseDto
        {
            CategoryId = category.CategoryId,
            Name = category.Name,
            Description = category.Description,
            ImageUrl = category.ImageUrl,
            ProductCount = 0,
            IsDeleted = category.IsDeleted,
            CreatedBy = category.CreatedBy,
            CreatedAt = category.CreatedAt,
            UpdatedBy = category.UpdatedBy,
            UpdatedAt = category.UpdatedAt,
        };
    }

    public async Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto, CancellationToken cancellationToken = default)
    {
        var category = await _categoryRepository.GetTrackedActiveByIdAsync(id, cancellationToken);
        if (category is null)
            return null;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = "System";

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
        category.UpdatedBy = "System";
        await _categoryRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CategoryResponseDto MapToDto(Category c) => new()
    {
        CategoryId = c.CategoryId,
        Name = c.Name,
        Description = c.Description,
        ImageUrl = c.ImageUrl,
        ProductCount = c.Products.Count,
        IsDeleted = c.IsDeleted,
        CreatedBy = c.CreatedBy,
        CreatedAt = c.CreatedAt,
        UpdatedBy = c.UpdatedBy,
        UpdatedAt = c.UpdatedAt,
    };
}
