using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class UpdateProductDto : IValidatableObject
{
    [Required(ErrorMessage = "Kategori seçilmelidir.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçiniz.")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [MinLength(2, ErrorMessage = "Ürün adı en az 2 karakter olmalıdır.")]
    [MaxLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olmalıdır.")]
    public string? Description { get; set; }

    [MaxLength(500, ErrorMessage = "Resim URL en fazla 500 karakter olmalıdır.")]
    public string? ImageUrl { get; set; }

    [MaxLength(32, ErrorMessage = "Barkod en fazla 32 karakter olabilir.")]
    [RegularExpression(@"^$|^[0-9]{8,14}$", ErrorMessage = "Barkod boş bırakılabilir veya 8–14 haneli rakam olmalıdır.")]
    public string? Barcode { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335", ErrorMessage = "Geçerli bir fiyat giriniz.")]
    public decimal Price { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? OriginalPrice { get; set; }

    public bool IsDiscount { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stok 0 veya üzeri olmalıdır.")]
    public int Stock { get; set; }

    [Required(ErrorMessage = "Durum zorunludur.")]
    [ProductStatusValue]
    [MaxLength(20)]
    public string Status { get; set; } = "active";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (IsDiscount)
        {
            if (OriginalPrice is not decimal op || op <= 0)
                yield return new ValidationResult(
                    "İndirimde liste fiyatı (OriginalPrice) zorunludur.",
                    [nameof(OriginalPrice)]);
            if (Price >= (OriginalPrice ?? 0))
                yield return new ValidationResult(
                    "İndirimli satış fiyatı, liste fiyatından düşük olmalıdır.",
                    [nameof(Price)]);
        }
        else if (OriginalPrice.HasValue)
        {
            yield return new ValidationResult(
                "İndirim kapalıyken OriginalPrice gönderilmemelidir.",
                [nameof(OriginalPrice)]);
        }
    }
}
