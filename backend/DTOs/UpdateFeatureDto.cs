using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UpdateFeatureDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
