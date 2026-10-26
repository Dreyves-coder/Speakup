import { apiRequest } from "@/services/api-client";
import { sanitizeUserPreferences } from "@/services/user-preferences-storage";
import type { UserPreferences } from "@/types/user-preferences";

export async function getUserPreferences(
  token: string,
): Promise<UserPreferences> {
  return sanitizeUserPreferences(
    await apiRequest<unknown>("/profile", { token }),
  );
}

export async function syncUserPreferences(
  preferences: UserPreferences,
  token: string,
): Promise<UserPreferences> {
  return sanitizeUserPreferences(
    await apiRequest<unknown>("/profile", {
      body: preferences,
      method: "PUT",
      token,
    }),
  );
}
