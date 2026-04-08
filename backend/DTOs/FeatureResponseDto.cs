using backend.Models;

namespace backend.DTOs;

public class FeatureResponseDto
{
    public int FeatureId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public FeatureResponseDto(Feature f)
    {
        FeatureId = f.FeatureId;
        Name = f.Name;
        IsDeleted = f.IsDeleted;
        CreatedBy = f.CreatedBy;
        CreatedAt = f.CreatedAt;
        UpdatedBy = f.UpdatedBy;
        UpdatedAt = f.UpdatedAt;
    }
}
