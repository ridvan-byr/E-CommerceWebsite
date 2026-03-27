using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryResponseDto>> GetAllAsync();
        Task<CategoryResponseDto?> GetByIdAsync(int id);
        Task<CategoryResponseDto> CreateAsync(CreateCategoryDto dto);
        Task<CategoryResponseDto?> UpdateAsync(int id, UpdateCategoryDto dto);
        Task<bool> SoftDeleteAsync(int id);
    }
}