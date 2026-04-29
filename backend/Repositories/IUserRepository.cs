using backend.Models;

namespace backend.Repositories;

// REVIEW [C2] Bu interface'de aynı sorgu için tracking/no-tracking ikilisi var:
//
//   GetByIdAsync          / GetByIdTrackingAsync
//   GetByEmailAsync       / GetByEmailTrackingAsync
//   GetByFirebaseUidAsync / GetByFirebaseUidTrackingAsync
//
// = 6 metod. Her yeni filtre eklendiğinde 2 metod eklemek zorundasın. Daha
// temizi: tek metod + opsiyonel `bool tracking = false` parametresi.
//
//     Task<User?> GetByEmailAsync(
//         string normalizedEmail,
//         bool tracking = false,
//         CancellationToken cancellationToken = default);
//
// Implementation:
//
//     var query = _context.Users.AsQueryable();
//     if (!tracking) query = query.AsNoTracking();
//     return await query.FirstOrDefaultAsync(...);
//
// Avantaj: interface küçülür, repository implementation tek satır
// genişler, çağıranın niyeti açıkça görünür:
//
//     var user = await _userRepository.GetByEmailAsync(email, tracking: true, ct);
//
// Bu küçük bir refactor ama "interface büyürse her tarafa yayılır" sezgisini
// erken kazanmak çok değerli. Interface ne kadar büyürse, mock'lamak ve
// gelecekte değiştirmek o kadar zorlaşır (Interface Segregation — SOLID-I).
//
// Anahtar kelime: "EF Core AsNoTracking", "Interface Segregation Principle".
public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default);

    Task<User?> GetByIdTrackingAsync(int userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<int, User>> GetByIdsAsync(
        IReadOnlyList<int> userIds,
        CancellationToken cancellationToken = default);

    /// <summary>Küçük harf normalize edilmiş e-posta listesi ile eşleşen kullanıcılar.</summary>
    Task<IReadOnlyDictionary<string, User>> GetByEmailsAsync(
        IReadOnlyList<string> normalizedEmails,
        CancellationToken cancellationToken = default);

    Task<User?> GetByEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    /// <summary>
    /// Firebase UID ile eşleşen kullanıcı. Yoksa null döner.
    /// Mevcut eşleştirmeyi güncelleyebilmek için tracking'li kullanım gerekirse
    /// <see cref="GetByFirebaseUidTrackingAsync"/> tercih edilmelidir.
    /// </summary>
    Task<User?> GetByFirebaseUidAsync(string firebaseUid, CancellationToken cancellationToken = default);

    Task<User?> GetByFirebaseUidTrackingAsync(string firebaseUid, CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    /// <summary>Sistemde herhangi bir kullanıcı var mı? (İlk kayıtta admin atamak için.)</summary>
    Task<bool> AnyAsync(CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);

    Task<User?> GetByEmailTrackingAsync(string normalizedEmail, CancellationToken cancellationToken = default);

    Task<User?> GetByResetTokenAsync(string token, CancellationToken cancellationToken = default);

    Task<User?> GetByVerificationTokenAsync(string token, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
