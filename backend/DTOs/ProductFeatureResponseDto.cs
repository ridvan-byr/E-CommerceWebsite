using backend.Models;

namespace backend.DTOs;

public class ProductFeatureResponseDto
{
    public int ProductFeatureId { get; set; }
    public int ProductId { get; set; }
    public int FeatureId { get; set; }
    public string FeatureName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ProductFeatureResponseDto()
    {
    }

    public ProductFeatureResponseDto(ProductFeature pf)
    {
        ProductFeatureId = pf.ProductFeatureId;
        ProductId = pf.ProductId;
        FeatureId = pf.FeatureId;
        Value = pf.Value;
        SortOrder = pf.SortOrder;
        FeatureName = pf.Feature?.Name ?? string.Empty;
        CreatedBy = pf.CreatedBy;
        CreatedAt = pf.CreatedAt;
        UpdatedBy = pf.UpdatedBy;
        UpdatedAt = pf.UpdatedAt;
    }
}
