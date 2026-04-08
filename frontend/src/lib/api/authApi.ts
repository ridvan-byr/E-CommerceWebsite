import { apiRequest } from "./client";
import type { AuthResponseDto } from "./types";

export async function login(email: string, password: string): Promise<AuthResponseDto> {
  return apiRequest<AuthResponseDto>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
