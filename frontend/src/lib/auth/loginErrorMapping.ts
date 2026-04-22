import { FirebaseError } from "firebase/app";
import { ApiRequestError } from "@/lib/api/client";

export function getFirebaseLoginErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/invalid-email":
      return "Geçersiz e-posta adresi.";
    case "auth/user-disabled":
      return "Bu hesap devre dışı bırakılmış.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.";
    case "auth/network-request-failed":
      return "Ağ hatası. Bağlantınızı kontrol edin.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Giriş penceresi kapatıldı.";
    default:
      return "Giriş yapılamadı. Lütfen tekrar deneyin.";
  }
}

export type LoginFailure =
  | { type: "message"; message: string }
  | { type: "unverified"; email: string };

export function mapLoginFailure(err: unknown, emailFallback: string): LoginFailure {
  if (err instanceof FirebaseError) {
    return { type: "message", message: getFirebaseLoginErrorMessage(err.code) };
  }
  if (err instanceof ApiRequestError) {
    const body = err.body as Record<string, unknown> | null;
    if (
      err.status === 403 &&
      typeof body === "object" &&
      body !== null &&
      body.errorCode === "EMAIL_NOT_VERIFIED"
    ) {
      const unverEmail =
        typeof body.email === "string" ? body.email : emailFallback.trim();
      return { type: "unverified", email: unverEmail };
    }
    const msg =
      typeof err.body === "object" &&
      err.body !== null &&
      "message" in err.body &&
      typeof (err.body as { message: unknown }).message === "string"
        ? (err.body as { message: string }).message
        : err.message;
    return { type: "message", message: msg };
  }
  return { type: "message", message: "Giriş yapılamadı. Bağlantınızı kontrol edin." };
}
