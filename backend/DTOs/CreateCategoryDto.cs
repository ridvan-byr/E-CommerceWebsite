using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateCategoryDto
{
    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [MinLength(2, ErrorMessage = "Kategori adı en az 2 karakter olmalıdır.")]
    [MaxLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;
    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olmalıdır.")]
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
}