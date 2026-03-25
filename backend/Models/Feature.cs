namespace backend.Models;

public class Feature
{
    public int FeatureId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProductFeature> ProductFeatures { get; set; } = new List<ProductFeature>();
}
