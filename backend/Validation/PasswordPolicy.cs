namespace backend.Validation;

/// <summary>Şifre: en az bir küçük / büyük harf (Unicode), rakam, özel karakter; boşluk yok.</summary>
public static class PasswordPolicy
{
    public const int MinLength = 8;
    public const int MaxLength = 128;

    /// <summary>Özel karakter: harf ve rakam dışı (ör. !@#.). Boşluk yasak (lookahead ile).</summary>
    public const string StrongPasswordPattern = @"^(?!.*\s)(?=.*\d)(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[^0-9\p{L}]).{8,128}$";

    public const string StrongPasswordErrorMessage =
        "Şifre 8-128 karakter olmalı; en az bir küçük harf, bir büyük harf, bir rakam ve en az bir özel karakter (ör. !@#$%) içermelidir; boşluk kullanılamaz.";
}
