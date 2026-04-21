namespace backend.Models;

public class ProductFeature
{
    public int ProductFeatureId { get; set; }
    public int ProductId { get; set; }
    public int FeatureId { get; set; }
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public int? CreatedByUserId { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Product Product { get; set; } = null!;
    public Feature Feature { get; set; } = null!;
}
