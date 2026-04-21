using FirebaseAdmin.Auth;

namespace backend.Services;

public interface IFirebaseAuthService
{
    /// <summary>
    /// İstemciden gelen Firebase ID Token'ı doğrular.
    /// Token geçersizse veya süresi dolmuşsa <see cref="FirebaseAuthException"/> fırlatır.
    /// </summary>
    Task<FirebaseToken> VerifyIdTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
