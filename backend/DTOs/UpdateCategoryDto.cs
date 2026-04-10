using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UpdateCategoryDto
{
    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [MinLength(2, ErrorMessage = "Kategori adı en az 2 karakter olmalıdır.")]
    [MaxLength(100, ErrorMessage = "Kategori adı en fazla 100 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;
}
