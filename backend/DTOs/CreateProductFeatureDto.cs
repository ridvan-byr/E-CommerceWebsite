using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateProductFeatureDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir özellik tanımı seçin.")]
    public int FeatureId { get; set; }

    [Required]
    [StringLength(500)]
    public string Value { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int? SortOrder { get; set; }
}
