namespace backend.Models;

public class Product
{
    public int ProductId { get; set; }
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public bool IsDiscount { get; set; }
    public int Stock { get; set; }
    public string Status { get; set; } = "active";
    public string? ImageUrl { get; set; }
    public bool IsDeleted { get; set; } = false;
    /// <summary>Denetim: oturumdaki kullanıcı kimliği. Kayıtların kim tarafından görüleceğini belirlemez.</summary>
    public int? CreatedByUserId { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    /// <summary>Denetim: son güncelleyen kullanıcı kimliği.</summary>
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Category Category { get; set; } = null!;
    public ICollection<ProductPrice> ProductPrices { get; set; } = new List<ProductPrice>();
    public ICollection<ProductFeature> ProductFeatures { get; set; } = new List<ProductFeature>();
}
