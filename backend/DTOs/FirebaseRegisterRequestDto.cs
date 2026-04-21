using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class FirebaseRegisterRequestDto
{
    /// <summary>Firebase createUserWithEmailAndPassword'dan alınan ID Token.</summary>
    [Required]
    public string IdToken { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Surname { get; set; } = string.Empty;
}
