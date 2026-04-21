using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class FirebaseLoginRequestDto
{
    /// <summary>
    /// Firebase istemcisinin döndürdüğü ID Token (JWT). Backend bu token'ı
    /// Firebase Admin SDK ile doğrular ve kendi access token'ını üretir.
    /// </summary>
    [Required]
    public string IdToken { get; set; } = string.Empty;
}
