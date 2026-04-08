using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UpdateProductFeatureDto
{
    [Required]
    [StringLength(500)]
    public string Value { get; set; } = string.Empty;

    [Required]
    [Range(0, int.MaxValue)]
    public int SortOrder { get; set; }
}
