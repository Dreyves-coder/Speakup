import { apiRequest } from "@/services/api-client";
import type { AuthSession, AuthUser } from "@/types/auth";
import type { UserPreferences } from "@/types/user-preferences";

export function loginRequest(email: string, password: string) {
  return apiRequest<AuthSession>("/auth/login", {
    body: { email, password },
    method: "POST",
  });
}

export function registerRequest(
  email: string,
  password: string,
  preferences: UserPreferences,
) {
  return apiRequest<AuthSession>("/auth/register", {
    body: { email, password, ...preferences },
    method: "POST",
  });
}

export function getCurrentUserRequest(token: string) {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export function deleteAccountRequest(token: string) {
  return apiRequest<void>("/auth/me", { method: "DELETE", token });
}
