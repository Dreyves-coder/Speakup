export type DailyGoal = 5 | 10 | 15 | 20;

export type EnglishLevelId = "a1" | "a2" | "b1" | "b2-plus" | "unknown";

export type UserPreferences = {
  dailyGoal: DailyGoal;
  dailyReminder: boolean;
  dailyReminderDays: number[];
  dailyReminderTime: string;
  calendarEventEnabled: boolean;
  calendarId: string | null;
  displayName: string;
  englishLevel: EnglishLevelId;
  hapticFeedback: boolean;
  soundEffects: boolean;
};
