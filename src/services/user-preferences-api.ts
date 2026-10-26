import { apiRequest } from "@/services/api-client";
import {
  loadUserPreferences,
  sanitizeUserPreferences,
} from "@/services/user-preferences-storage";
import type { UserPreferences } from "@/types/user-preferences";

export async function getUserPreferences(
  token: string,
): Promise<UserPreferences> {
  const [remote, local] = await Promise.all([
    apiRequest<unknown>("/profile", { token }),
    loadUserPreferences(),
  ]);
  return {
    ...sanitizeUserPreferences(remote),
    dailyReminderDays: local.dailyReminderDays,
    dailyReminderTime: local.dailyReminderTime,
    calendarEventEnabled: local.calendarEventEnabled,
    calendarId: local.calendarId,
  };
}

export async function syncUserPreferences(
  preferences: UserPreferences,
  token: string,
): Promise<UserPreferences> {
  const remote = await apiRequest<unknown>("/profile", {
    body: {
      dailyGoal: preferences.dailyGoal,
      dailyReminder: preferences.dailyReminder,
      displayName: preferences.displayName,
      englishLevel: preferences.englishLevel,
      hapticFeedback: preferences.hapticFeedback,
      soundEffects: preferences.soundEffects,
    },
    method: "PUT",
    token,
  });
  const sanitizedRemote = sanitizeUserPreferences(remote);
  return {
    ...sanitizedRemote,
    dailyReminderDays: preferences.dailyReminderDays,
    dailyReminderTime: preferences.dailyReminderTime,
    calendarEventEnabled: preferences.calendarEventEnabled,
    calendarId: preferences.calendarId,
  };
}
