using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CreateProductPriceDto : IValidatableObject
{
    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335", ErrorMessage = "Geçerli bir fiyat giriniz.")]
    public decimal Price { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal? OriginalPrice { get; set; }

    public bool IsDiscount { get; set; }

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
