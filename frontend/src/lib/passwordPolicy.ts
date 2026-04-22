/** Backend `PasswordPolicy.StrongPasswordPattern` ile uyumlu (Unicode harf; boşluk yok). */
const STRONG_PASSWORD_REGEX =
  /^(?!.*\s)(?=.*\d)(?=.*\p{Ll})(?=.*\p{Lu})(?=.*[^0-9\p{L}]).{8,128}$/u;

export const PASSWORD_POLICY_MESSAGE =
  "Şifre 8-128 karakter olmalı; en az bir küçük harf, bir büyük harf, bir rakam ve en az bir özel karakter (ör. !@#) içermelidir; boşluk kullanılamaz.";

export function isPasswordCompliant(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}
