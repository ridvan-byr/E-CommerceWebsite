using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UpdateProductFeatureDto
{
    /// <summary>
    /// Özellik adını değiştirmek için gönderin; atlanırsa veya boşsa mevcut ad korunur.
    /// </summary>
    [StringLength(100)]
    public string? Name { get; set; }

    [Required(ErrorMessage = "Değer zorunludur.")]
    [StringLength(500)]
    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
