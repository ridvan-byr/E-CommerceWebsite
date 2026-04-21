using backend.Models;

namespace backend.Helpers;

public static class UserDisplay
{
    public static string FullName(User user)
    {
        var s = $"{user.Name} {user.Surname}".Trim();
        return s.Length > 0 ? s : "Kullanıcı";
    }
}
