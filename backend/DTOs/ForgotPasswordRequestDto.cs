using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class ForgotPasswordRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}
