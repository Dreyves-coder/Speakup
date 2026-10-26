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
    dailyReminder:
      typeof stored.dailyReminder === "boolean"
        ? stored.dailyReminder
        : DEFAULT_USER_PREFERENCES.dailyReminder,
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
