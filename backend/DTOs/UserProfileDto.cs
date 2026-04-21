namespace backend.DTOs;

public class UserProfileDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    /// <summary>Firebase/Google profil fotoğrafı. Yoksa null.</summary>
    public string? PhotoUrl { get; set; }
}
