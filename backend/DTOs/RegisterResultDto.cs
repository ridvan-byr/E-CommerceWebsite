namespace backend.DTOs;

public class RegisterResultDto
{
    public string Email { get; set; } = string.Empty;
    public string Message { get; set; } = "Doğrulama e-postası gönderildi. Gelen kutunuzu kontrol edin.";
}
