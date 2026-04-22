/** Eski sürümde düz metin token localStorage'daydı; HttpOnly cookie sonrası bir kez silinir. */
const LEGACY_TOKEN_KEY = "ecommerce_access_token";

export const USER_PROFILE_STORAGE_KEY = "ecommerce_user_profile";
/** Uygulama içi setStoredUserProfile sonrası CurrentUser state senkronu */
export const USER_PROFILE_CHANGED_EVENT = "ecommerce-user-profile-changed";

let legacyTokenCleared = false;

function clearLegacyTokenOnce(): void {
  if (typeof window === "undefined" || legacyTokenCleared) return;
  legacyTokenCleared = true;
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function setStoredUserProfile(profile: unknown): void {
  if (typeof window === "undefined") return;
  if (profile) localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  try {
    window.dispatchEvent(new Event(USER_PROFILE_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function getStoredUserProfile(): unknown | null {
  if (typeof window === "undefined") return null;
  const profile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
  return profile ? JSON.parse(profile) : null;
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5288";
}

export type ApiErrorBody = { message?: string; errors?: Record<string, string[]> };

/** ASP.NET ValidationProblemDetails / ModelState yanıtlarından okunabilir metin üretir. */
function formatErrorMessage(parsed: unknown, fallback: string): string {
  if (parsed == null || typeof parsed !== "object") return fallback;
  const o = parsed as Record<string, unknown>;
  const direct = o.message ?? o.title;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const errors = o.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    const parts: string[] = [];
    for (const [, msgs] of Object.entries(errors as Record<string, unknown>)) {
      if (Array.isArray(msgs)) {
        for (const m of msgs) {
          if (typeof m === "string") parts.push(m);
        }
      } else if (typeof msgs === "string") {
        parts.push(msgs);
      }
    }
    if (parts.length) return parts.join(" ");
  }
  return fallback;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

let sessionInvalidationInProgress = false;

/** 401, yanlış giriş denemesinde olsa oturum sonu gibi yorumlanmamalı. */
function isUnauthenticatedLoginAttempt(path: string, method: string): boolean {
  const p = (path.split("?")[0] || "").split("#")[0] || "/";
  const m = method.toUpperCase();
  if (m !== "POST") return false;
  return p === "/api/auth/login" || p === "/api/auth/firebase-login";
}

/**
 * Cookie (access token) yok/ geçersiz (401) — profili sil, sunucu + Firebase oturumunu kapat, girişe yönlendir.
 * `apiRequest` dışında (ör. XHR) 401 alındığında da çağrılabilir.
 */
export function performSessionInvalidationFromUnauthorized(): void {
  if (typeof window === "undefined" || sessionInvalidationInProgress) return;
  sessionInvalidationInProgress = true;
  try {
    setStoredUserProfile(null);
  } catch {
    /* ignore */
  }
  const base = getApiBaseUrl();
  void fetch(`${base}/api/auth/logout`, { method: "POST", credentials: "include" });
  void import("firebase/auth")
    .then(({ signOut }) => import("@/lib/firebase").then(({ auth }) => signOut(auth)))
    .catch(() => {
      /* ignore */
    });
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  } else {
    sessionInvalidationInProgress = false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { parseJson?: boolean } = {}
): Promise<T> {
  const { parseJson = true, ...init } = options;
  clearLegacyTokenOnce();
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401) {
      const m = (init.method ?? "GET").toUpperCase();
      if (!isUnauthenticatedLoginAttempt(path, m)) {
        performSessionInvalidationFromUnauthorized();
      }
    }
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }
    const msg = formatErrorMessage(parsed, res.statusText);
    throw new ApiRequestError(msg || `HTTP ${res.status}`, res.status, parsed);
  }

  if (!parseJson || !text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
