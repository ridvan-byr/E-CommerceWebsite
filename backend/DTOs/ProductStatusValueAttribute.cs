using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs;

public sealed class ProductStatusValueAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string s || string.IsNullOrWhiteSpace(s))
            return new ValidationResult("Durum zorunludur.");

        if (s != ProductStatuses.Active && s != ProductStatuses.Inactive && s != ProductStatuses.Draft)
            return new ValidationResult("Durum yalnızca active, inactive veya draft olabilir.");

        return ValidationResult.Success;
    }
}
