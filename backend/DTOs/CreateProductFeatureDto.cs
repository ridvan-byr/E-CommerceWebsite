using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

/// <summary>
/// Ürüne özellik ekler: özellik adı + değer. Sunucu gerekirse Features tablosunda tanım oluşturur veya mevcut olanı kullanır.
/// </summary>
public class CreateProductFeatureDto
{
    [Required(ErrorMessage = "Özellik adı zorunludur.")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Özellik adı 1–100 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Değer zorunludur.")]
    [StringLength(500, ErrorMessage = "Değer en fazla 500 karakter olabilir.")]
    public string Value { get; set; } = string.Empty;

    public int? SortOrder { get; set; }
}
