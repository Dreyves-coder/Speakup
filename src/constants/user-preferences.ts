import type {
  DailyGoal,
  EnglishLevelId,
  UserPreferences,
} from "@/types/user-preferences";

export const DAILY_GOALS: readonly DailyGoal[] = [5, 10, 15, 20];

export const ENGLISH_LEVELS: Record<
  EnglishLevelId,
  { code: string; label: string }
> = {
  a1: { code: "A1", label: "Beginner" },
  a2: { code: "A2", label: "Elementary" },
  b1: { code: "B1", label: "Intermediate" },
  "b2-plus": { code: "B2+", label: "Upper intermediate" },
  unknown: { code: "?", label: "To be confirmed" },
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  dailyGoal: 10,
  dailyReminder: true,
  displayName: "Alex Morgan",
  englishLevel: "a1",
  hapticFeedback: false,
  soundEffects: true,
};

export function isDailyGoal(value: unknown): value is DailyGoal {
  return typeof value === "number" && DAILY_GOALS.includes(value as DailyGoal);
}

export function isEnglishLevel(value: unknown): value is EnglishLevelId {
  return typeof value === "string" && value in ENGLISH_LEVELS;
}
