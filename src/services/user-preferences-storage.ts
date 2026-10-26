import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEFAULT_USER_PREFERENCES,
  isDailyGoal,
  isEnglishLevel,
} from "@/constants/user-preferences";
import type { UserPreferences } from "@/types/user-preferences";

const STORAGE_KEY = "@speakup/user-preferences/v1";

export function sanitizeUserPreferences(value: unknown): UserPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_USER_PREFERENCES;
  }

  const stored = value as Partial<UserPreferences>;

  return {
    dailyGoal: isDailyGoal(stored.dailyGoal)
      ? stored.dailyGoal
      : DEFAULT_USER_PREFERENCES.dailyGoal,
    dailyReminderDays: Array.isArray(stored.dailyReminderDays)
      ? [...new Set(stored.dailyReminderDays)].filter(
          (day): day is number =>
            typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6,
        )
      : DEFAULT_USER_PREFERENCES.dailyReminderDays,
    dailyReminder:
      typeof stored.dailyReminder === "boolean"
        ? stored.dailyReminder
        : DEFAULT_USER_PREFERENCES.dailyReminder,
    dailyReminderTime:
      typeof stored.dailyReminderTime === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(stored.dailyReminderTime)
        ? stored.dailyReminderTime
        : DEFAULT_USER_PREFERENCES.dailyReminderTime,
    calendarEventEnabled:
      typeof stored.calendarEventEnabled === "boolean"
        ? stored.calendarEventEnabled
        : DEFAULT_USER_PREFERENCES.calendarEventEnabled,
    calendarId:
      typeof stored.calendarId === "string"
        ? stored.calendarId
        : DEFAULT_USER_PREFERENCES.calendarId,
    displayName:
      typeof stored.displayName === "string" && stored.displayName.trim()
        ? stored.displayName.trim()
        : DEFAULT_USER_PREFERENCES.displayName,
    englishLevel: isEnglishLevel(stored.englishLevel)
      ? stored.englishLevel
      : DEFAULT_USER_PREFERENCES.englishLevel,
    hapticFeedback:
      typeof stored.hapticFeedback === "boolean"
        ? stored.hapticFeedback
        : DEFAULT_USER_PREFERENCES.hapticFeedback,
    soundEffects:
      typeof stored.soundEffects === "boolean"
        ? stored.soundEffects
        : DEFAULT_USER_PREFERENCES.soundEffects,
  };
}

export async function loadUserPreferences(): Promise<UserPreferences> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return DEFAULT_USER_PREFERENCES;
  }

  try {
    return sanitizeUserPreferences(JSON.parse(storedValue));
  } catch {
    return DEFAULT_USER_PREFERENCES;
  }
}

export async function saveUserPreferences(
  preferences: UserPreferences,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
