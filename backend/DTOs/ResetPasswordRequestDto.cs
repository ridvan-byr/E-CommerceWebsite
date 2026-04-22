using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.DTOs;

public class ResetPasswordRequestDto
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    [RegularExpression(PasswordPolicy.StrongPasswordPattern, ErrorMessage = PasswordPolicy.StrongPasswordErrorMessage)]
    public string NewPassword { get; set; } = string.Empty;
}
