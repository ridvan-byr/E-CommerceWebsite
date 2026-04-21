using System.Collections.Generic;
using System.Linq;
using backend.DTOs;
using backend.Helpers;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

/// <summary>API yanıtında <c>CreatedBy</c>/<c>UpdatedBy</c> alanlarını veritabanındaki ad soyad ile doldurur (eski e-posta metinlerini düzeltir).</summary>
public static class AuditDtoEnricher
{
    public static async Task EnrichProductsAsync(
        IReadOnlyList<ProductResponseDto> items,
        IUserRepository users,
        CancellationToken cancellationToken = default)
    {
        if (items.Count == 0)
            return;

        var idSet = new HashSet<int>();
        foreach (var i in items)
        {
            if (i.CreatedByUserId is int c)
                idSet.Add(c);
            if (i.UpdatedByUserId is int u)
                idSet.Add(u);
        }

        var byId = idSet.Count > 0
            ? await users.GetByIdsAsync(idSet.ToList(), cancellationToken)
            : new Dictionary<int, User>();

        var emailSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var i in items)
        {
            if (i.CreatedByUserId == null && LooksLikeEmail(i.CreatedBy))
                emailSet.Add(NormalizeEmail(i.CreatedBy!));
            if (i.UpdatedByUserId == null && LooksLikeEmail(i.UpdatedBy))
                emailSet.Add(NormalizeEmail(i.UpdatedBy!));
        }

        var byEmail = emailSet.Count > 0
            ? await users.GetByEmailsAsync(emailSet.ToList(), cancellationToken)
            : new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        foreach (var i in items)
        {
            if (i.CreatedByUserId is int cid && byId.TryGetValue(cid, out var cu))
                i.CreatedBy = UserDisplay.FullName(cu);
            else if (i.CreatedByUserId == null && LooksLikeEmail(i.CreatedBy)
                     && byEmail.TryGetValue(NormalizeEmail(i.CreatedBy!), out var cu2))
                i.CreatedBy = UserDisplay.FullName(cu2);

            if (i.UpdatedByUserId is int uid && byId.TryGetValue(uid, out var uu))
                i.UpdatedBy = UserDisplay.FullName(uu);
            else if (i.UpdatedByUserId == null && LooksLikeEmail(i.UpdatedBy)
                     && byEmail.TryGetValue(NormalizeEmail(i.UpdatedBy!), out var uu2))
                i.UpdatedBy = UserDisplay.FullName(uu2);
        }
    }

    public static async Task EnrichCategoriesAsync(
        IReadOnlyList<CategoryResponseDto> items,
        IUserRepository users,
        CancellationToken cancellationToken = default)
    {
        if (items.Count == 0)
            return;

        var idSet = new HashSet<int>();
        foreach (var i in items)
        {
            if (i.CreatedByUserId is int c)
                idSet.Add(c);
            if (i.UpdatedByUserId is int u)
                idSet.Add(u);
        }

        var byId = idSet.Count > 0
            ? await users.GetByIdsAsync(idSet.ToList(), cancellationToken)
            : new Dictionary<int, User>();

        var emailSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var i in items)
        {
            if (i.CreatedByUserId == null && LooksLikeEmail(i.CreatedBy))
                emailSet.Add(NormalizeEmail(i.CreatedBy!));
            if (i.UpdatedByUserId == null && LooksLikeEmail(i.UpdatedBy))
                emailSet.Add(NormalizeEmail(i.UpdatedBy!));
        }

        var byEmail = emailSet.Count > 0
            ? await users.GetByEmailsAsync(emailSet.ToList(), cancellationToken)
            : new Dictionary<string, User>(StringComparer.OrdinalIgnoreCase);

        foreach (var i in items)
        {
            if (i.CreatedByUserId is int cid && byId.TryGetValue(cid, out var cu))
                i.CreatedBy = UserDisplay.FullName(cu);
            else if (i.CreatedByUserId == null && LooksLikeEmail(i.CreatedBy)
                     && byEmail.TryGetValue(NormalizeEmail(i.CreatedBy!), out var cu2))
                i.CreatedBy = UserDisplay.FullName(cu2);

            if (i.UpdatedByUserId is int uid && byId.TryGetValue(uid, out var uu))
                i.UpdatedBy = UserDisplay.FullName(uu);
            else if (i.UpdatedByUserId == null && LooksLikeEmail(i.UpdatedBy)
                     && byEmail.TryGetValue(NormalizeEmail(i.UpdatedBy!), out var uu2))
                i.UpdatedBy = UserDisplay.FullName(uu2);
        }
    }

    private static bool LooksLikeEmail(string? s) =>
        !string.IsNullOrWhiteSpace(s) && s.Contains('@');

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
