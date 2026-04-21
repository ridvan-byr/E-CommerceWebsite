using FirebaseAdmin.Auth;

namespace backend.Services;

public class FirebaseAuthService : IFirebaseAuthService
{
    public Task<FirebaseToken> VerifyIdTokenAsync(string idToken, CancellationToken cancellationToken = default)
        => FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken, cancellationToken);
}
