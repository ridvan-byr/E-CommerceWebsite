using System.ComponentModel.DataAnnotations;
using backend.Validation;

namespace backend.DTOs;

/// <summary>
/// OAuth (ör. Google) ile açılmış hesaba istemci tarafında Firebase e-posta/şifre bağlandıktan sonra
/// yerel DB'deki placeholder hash'in güncellenmesi için kullanılır.
/// </summary>
public class SetLinkedPasswordRequestDto
{
    [Required]
    [StringLength(128, MinimumLength = 8)]
    [RegularExpression(PasswordPolicy.StrongPasswordPattern, ErrorMessage = PasswordPolicy.StrongPasswordErrorMessage)]
    public string Password { get; set; } = string.Empty;
}
