using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateProductDto
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [MinLength(2, ErrorMessage = "Ürün adı en az 2 karakter olmalıdır.")]
    [MaxLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olmalıdır.")]
    public string? Description { get; set; }

    
    [MaxLength(50, ErrorMessage = "SKU kodu en fazla 50 karakter olmalıdır.")]
    public string? Sku { get; set; }

    [Required(ErrorMessage = "Kategori seçilmelidir.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçiniz.")]
    public int CategoryId { get; set; }

    [Required]
    [Range(typeof(decimal), "0", "79228162514264337593543950335", ErrorMessage = "Fiyat 0 veya üzeri olmalıdır.")]
    public decimal Price { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? OriginalPrice { get; set; }

    public bool IsDiscount { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stok 0 veya üzeri olmalıdır.")]
    public int Stock { get; set; }

    [Required]
    [RegularExpression("^(active|inactive|draft)$", ErrorMessage = "Durum yalnızca active, inactive veya draft olabilir.")]
    [MaxLength(20)]
    public string Status { get; set; } = "active";

    [MaxLength(500, ErrorMessage = "Resim URL en fazla 500 karakter olmalıdır.")]
    public string? ImageUrl { get; set; }

    public List<CreateProductFeatureDto> Features { get; set; } = new List<CreateProductFeatureDto>();
}
