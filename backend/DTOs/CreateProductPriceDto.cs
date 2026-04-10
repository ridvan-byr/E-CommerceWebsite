using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateProductPriceDto : IValidatableObject
{
    [Required(ErrorMessage = "Fiyat zorunludur.")]
    public decimal Price { get; set; }

    public decimal? OriginalPrice { get; set; }

    public bool IsDiscount { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Price <= 0)
            yield return new ValidationResult("Geçerli bir fiyat giriniz.", [nameof(Price)]);
        if (OriginalPrice.HasValue && OriginalPrice.Value < 0)
            yield return new ValidationResult("Liste fiyatı negatif olamaz.", [nameof(OriginalPrice)]);

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
