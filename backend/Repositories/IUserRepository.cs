using backend.Models;

namespace backend.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<int, User>> GetByIdsAsync(
        IReadOnlyList<int> userIds,
        CancellationToken cancellationToken = default);

    /// <summary>Küçük harf normalize edilmiş e-posta listesi ile eşleşen kullanıcılar.</summary>
    Task<IReadOnlyDictionary<string, User>> GetByEmailsAsync(
        IReadOnlyList<string> normalizedEmails,
        CancellationToken cancellationToken = default);

    Task<User?> GetByEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    /// <summary>Sistemde herhangi bir kullanıcı var mı? (İlk kayıtta admin atamak için.)</summary>
    Task<bool> AnyAsync(CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailTrackingAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    Task<User?> GetByResetTokenAsync(string token, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
