import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase";
import { apiRequest } from "./client";
import type { AuthResponseDto, UserProfileDto } from "./types";

/** Supports both camelCase and PascalCase JSON from the API. */
function parseUserProfile(data: unknown): UserProfileDto {
  const u = data as Record<string, unknown>;
  const photoRaw = u.photoUrl ?? u.PhotoUrl;
  const kvkkRaw = u.kvkkAccepted ?? u.KvkkAccepted;
  return {
    userId: Number(u.userId ?? u.UserId ?? 0),
    name: String(u.name ?? u.Name ?? ""),
    surname: String(u.surname ?? u.Surname ?? ""),
    email: String(u.email ?? u.Email ?? ""),
    role: String(u.role ?? u.Role ?? ""),
    photoUrl: typeof photoRaw === "string" && photoRaw.length > 0 ? photoRaw : null,
    kvkkAccepted: kvkkRaw === true || kvkkRaw === "true",
  };
}

function parseAuthResponse(data: unknown): AuthResponseDto {
  const o = data as Record<string, unknown>;
  const accessToken = String(o.accessToken ?? o.AccessToken ?? "");
  const expiresAtUtc = String(o.expiresAtUtc ?? o.ExpiresAtUtc ?? "");
  const userRaw = o.user ?? o.User;
  if (!accessToken || userRaw == null || typeof userRaw !== "object") {
    throw new Error("Geçersiz oturum yanıtı.");
  }
  return {
    accessToken,
    expiresAtUtc,
    user: parseUserProfile(userRaw),
  };
}

export async function fetchCurrentUser(): Promise<UserProfileDto> {
  const raw = await apiRequest<unknown>("/api/auth/me");
  return parseUserProfile(raw);
}

export async function login(email: string, password: string): Promise<AuthResponseDto> {
  const raw = await apiRequest<unknown>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return parseAuthResponse(raw);
}

/**
 * Firebase ile yeni kullanıcı oluşturur (email+password), ardından
 * backend'e kaydeder ve doğrulama e-postası gönderir.
 * Giriş yapmaz; kullanıcı önce e-postasını doğrulamalıdır.
 */
export async function register(
  name: string,
  surname: string,
  email: string,
  password: string,
): Promise<{ email: string; message: string }> {
  // 1. Firebase'de kullanıcı oluştur
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  // 2. Firebase profiline isim yaz (isteğe bağlı, iyi pratik)
  await updateProfile(cred.user, { displayName: `${name.trim()} ${surname.trim()}` });
  // 3. Backend'e kaydet (yerel DB + doğrulama e-postası)
  const idToken = await cred.user.getIdToken();
  const raw = await apiRequest<Record<string, unknown>>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ idToken, name: name.trim(), surname: surname.trim() }),
  });
  // Firebase oturumunu kapat (kullanıcı önce e-posta doğrulamalı)
  await signOut(firebaseAuth);
  return {
    email: String(raw.email ?? raw.Email ?? email),
    message: String(raw.message ?? raw.Message ?? "Doğrulama e-postası gönderildi."),
  };
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const raw = await apiRequest<Record<string, unknown>>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return {
    message: String(raw.message ?? raw.Message ?? ""),
  };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export type ResetTokenStatus = "valid" | "expired" | "invalid";

export async function validateResetToken(token: string): Promise<ResetTokenStatus> {
  try {
    const raw = await apiRequest<Record<string, unknown>>(
      `/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
    );
    const status = String(raw.status ?? "invalid");
    if (status === "valid" || status === "expired") return status;
    return "invalid";
  } catch {
    return "invalid";
  }
}

/**
 * Verilen Firebase ID Token'ı backend'e gönderir, doğrulanırsa
 * backend kendi JWT'sini döner (diğer API çağrıları bu JWT ile yapılır).
 */
async function exchangeFirebaseIdTokenForJwt(idToken: string): Promise<AuthResponseDto> {
  const raw = await apiRequest<unknown>("/api/auth/firebase-login", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  return parseAuthResponse(raw);
}

/** Firebase üzerinden e-posta + şifre ile giriş yapar ve backend JWT'sini döner. */
export async function loginWithFirebase(email: string, password: string): Promise<AuthResponseDto> {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  const idToken = await cred.user.getIdToken();
  return exchangeFirebaseIdTokenForJwt(idToken);
}

/** Firebase üzerinden Google popup ile giriş yapar ve backend JWT'sini döner. */
export async function loginWithGoogle(): Promise<AuthResponseDto> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(firebaseAuth, provider);
  const idToken = await cred.user.getIdToken();
  return exchangeFirebaseIdTokenForJwt(idToken);
}

/** Firebase oturumunu sonlandırır. Backend JWT'sini temizlemek çağıran tarafın sorumluluğundadır. */
export async function firebaseSignOut(): Promise<void> {
  await signOut(firebaseAuth);
}

export type VerifyEmailResult = "success" | "already_verified" | "expired" | "invalid";

/** Doğrulama bağlantısından gelen token'ı backend'e iletir. */
export async function verifyEmail(token: string): Promise<VerifyEmailResult> {
  try {
    const raw = await apiRequest<Record<string, unknown>>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    );
    const status = String(raw.status ?? "invalid");
    if (status === "success" || status === "already_verified" || status === "expired") return status;
    return "invalid";
  } catch {
    return "invalid";
  }
}

/** Doğrulama e-postasını yeniden gönderir. */
export async function resendVerificationEmail(email: string): Promise<void> {
  await apiRequest("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Oturum açmış kullanıcının KVKK onayını backend'e kaydeder. */
export async function acceptKvkkConsent(): Promise<void> {
  await apiRequest("/api/auth/accept-consent", { method: "POST" });
}
