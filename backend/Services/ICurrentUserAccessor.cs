namespace backend.Services;

/// <summary>Oturumdaki kullanıcıyı (JWT) okur. Bu bilgi yalnızca denetim (kim oluşturdu/güncelledi) içindir; ürün veya kategori listelerinde görünürlük filtresi olarak kullanılmaz.</summary>
public interface ICurrentUserAccessor
{
    /// <summary>JWT <c>sub</c> / NameIdentifier; oturum yoksa null.</summary>
    int? UserId { get; }

    /// <summary>Veritabanındaki kullanıcıdan <b>Ad Soyad</b>; oturum yoksa <c>System</c>. E-posta kullanılmaz.</summary>
    Task<string> GetActorNameAsync(CancellationToken cancellationToken = default);
}
