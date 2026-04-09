import { apiRequest } from "./client";
import type { AuthResponseDto } from "./types";

export async function login(email: string, password: string): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  name: string,
  surname: string,
  email: string,
  password: string,
): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, surname, email, password }),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string; token?: string }> {
  return apiRequest<{ message: string; token?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}
