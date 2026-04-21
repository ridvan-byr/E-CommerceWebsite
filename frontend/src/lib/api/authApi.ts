import { apiRequest } from "./client";
import type { AuthResponseDto, UserProfileDto } from "./types";

/** Supports both camelCase and PascalCase JSON from the API. */
function parseUserProfile(data: unknown): UserProfileDto {
  const u = data as Record<string, unknown>;
  return {
    userId: Number(u.userId ?? u.UserId ?? 0),
    name: String(u.name ?? u.Name ?? ""),
    surname: String(u.surname ?? u.Surname ?? ""),
    email: String(u.email ?? u.Email ?? ""),
    role: String(u.role ?? u.Role ?? ""),
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

export async function register(
  name: string,
  surname: string,
  email: string,
  password: string,
): Promise<AuthResponseDto> {
  const raw = await apiRequest<unknown>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, surname, email, password }),
  });
  return parseAuthResponse(raw);
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
