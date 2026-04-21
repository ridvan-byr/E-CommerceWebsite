using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using backend.Validation;

namespace backend.DTOs;

public class UpdateProductDto : IValidatableObject
{
    private static readonly Regex SkuPattern = new(
        @"^[A-Z0-9][A-Z0-9._\-/]{0,48}[A-Z0-9]$",
        RegexOptions.Compiled,
        TimeSpan.FromMilliseconds(100));

    [Required(ErrorMessage = "Kategori seçilmelidir.")]
    [Range(1, int.MaxValue, ErrorMessage = "Geçerli bir kategori seçiniz.")]
    public int CategoryId { get; set; }

    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [MinLength(2, ErrorMessage = "Ürün adı en az 2 karakter olmalıdır.")]
    [MaxLength(200, ErrorMessage = "Ürün adı en fazla 200 karakter olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Açıklama zorunludur.")]
    [MinLength(1, ErrorMessage = "Açıklama boş olamaz.")]
    [MaxLength(2000, ErrorMessage = "Açıklama en fazla 2000 karakter olmalıdır.")]
    public string Description { get; set; } = string.Empty;

    /// <summary>Merchant-defined SKU — unique among active products.</summary>
    [Required(ErrorMessage = "SKU (stok kodu) zorunludur.")]
    [MaxLength(50, ErrorMessage = "SKU en fazla 50 karakter olabilir.")]
    public string Sku { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Resim URL en fazla 500 karakter olmalıdır.")]
    public string? ImageUrl { get; set; }

    /// <summary>GS1 GTIN (GTIN-8/12/13/14). Digits only, max 14 characters.</summary>
    [MaxLength(14, ErrorMessage = "Barkod en fazla 14 hane olabilir (GTIN-8/12/13/14).")]
    public string? Barcode { get; set; }

    [Required(ErrorMessage = "Fiyat zorunludur.")]
    public decimal Price { get; set; }

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
        if (Price <= 0)
            yield return new ValidationResult("Geçerli bir fiyat giriniz.", [nameof(Price)]);
        if (OriginalPrice.HasValue && OriginalPrice.Value < 0)
            yield return new ValidationResult("Liste fiyatı negatif olamaz.", [nameof(OriginalPrice)]);

        var sku = Sku?.Trim();
        if (string.IsNullOrEmpty(sku) || sku.Length < 2)
        {
            yield return new ValidationResult(
                "SKU en az 2 karakter olmalıdır.",
                [nameof(Sku)]);
        }
        else
        {
            var skuUpper = sku.ToUpperInvariant();
            if (skuUpper.Length > 50 || !SkuPattern.IsMatch(skuUpper))
            {
                yield return new ValidationResult(
                    "SKU harf ve rakam içermeli; nokta, tire, alt çizgi ve / kullanılabilir (ör. NIKE-AIR-42-BLK).",
                    [nameof(Sku)]);
            }
        }

        if (!GtinValidator.IsValidOrEmpty(Barcode))
        {
            yield return new ValidationResult(
                "Geçersiz GTIN barkodu (8, 12, 13 veya 14 hane ve doğru check digit).",
                [nameof(Barcode)]);
        }

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
