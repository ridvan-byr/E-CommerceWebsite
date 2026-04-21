namespace backend.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    /// <summary>Denetim: oturumdaki kullanıcı kimliği. Kategorinin kimlere listeleneceğini belirlemez.</summary>
    public int? CreatedByUserId { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    /// <summary>Denetim: son güncelleyen kullanıcı kimliği.</summary>
    public int? UpdatedByUserId { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
