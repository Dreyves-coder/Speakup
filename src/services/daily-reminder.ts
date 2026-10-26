import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

import type { UserPreferences } from "@/types/user-preferences";

const DAILY_REMINDER_ID = "speakup-daily-reminder";
const ANDROID_CHANNEL_ID = "daily-learning";
const CALENDAR_EVENTS_STORAGE_KEY = "@speakup/daily-reminder/calendar-events/v1";
let reminderSyncQueue: Promise<void> = Promise.resolve();

type CalendarEvents = {
  calendarId: string | null;
  eventIds: string[];
  signature: string | null;
};

type DailyReminderSettings = Pick<
  UserPreferences,
  | "calendarEventEnabled"
  | "calendarId"
  | "dailyReminder"
  | "dailyReminderDays"
  | "dailyReminderTime"
>;

async function getCalendarModule() {
  return import("expo-calendar/legacy");
}

async function loadCalendarEvents(): Promise<CalendarEvents> {
  const value = await AsyncStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
  if (!value) return { calendarId: null, eventIds: [], signature: null };

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      "eventIds" in parsed &&
      Array.isArray(parsed.eventIds)
    ) {
      return {
        calendarId:
          "calendarId" in parsed && typeof parsed.calendarId === "string"
            ? parsed.calendarId
            : null,
        eventIds: parsed.eventIds.filter(
          (id): id is string => typeof id === "string",
        ),
        signature:
          "signature" in parsed && typeof parsed.signature === "string"
            ? parsed.signature
            : null,
      };
    }
  } catch (error) {
    console.warn("Could not read saved SpeakUp calendar event IDs.", error);
  }

  return { calendarId: null, eventIds: [], signature: null };
}

async function saveCalendarEvents(value: CalendarEvents): Promise<void> {
  await AsyncStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(value));
}

export async function getWritableCalendars() {
  if (Platform.OS === "web" || Constants.expoGoConfig) return [];

  const Calendar = await getCalendarModule();
  const permission = await Calendar.requestCalendarPermissionsAsync();
  if (permission.status !== "granted") return [];

  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  return calendars.filter((calendar) => calendar.allowsModifications);
}

export async function configureNotificationHandling(): Promise<void> {
  if (Platform.OS === "web" || Constants.expoGoConfig) return;

  const Notifications = await import("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function getNextWeekday(day: number, hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  const daysUntil = (day - date.getDay() + 7) % 7;
  if (daysUntil === 0 && date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() + daysUntil);
  }
  return date;
}

async function syncCalendarEvents(
  preferences: DailyReminderSettings,
): Promise<void> {
  const Calendar = await getCalendarModule();
  const tracked = await loadCalendarEvents();

  const shouldCreateEvents =
    preferences.calendarEventEnabled &&
    Boolean(preferences.calendarId) &&
    preferences.dailyReminderDays.length > 0;
  const signature = shouldCreateEvents
    ? `${preferences.calendarId}|${preferences.dailyReminderTime}|${preferences.dailyReminderDays.join(",")}`
    : null;

  if (
    shouldCreateEvents &&
    tracked.calendarId === preferences.calendarId &&
    tracked.signature === signature
  ) {
    return;
  }

  for (const eventId of tracked.eventIds) {
    await Calendar.deleteEventAsync(eventId);
  }
  await saveCalendarEvents({ calendarId: null, eventIds: [], signature: null });

  if (!shouldCreateEvents || !preferences.calendarId || !signature) {
    return;
  }

  const permission = await Calendar.getCalendarPermissionsAsync();
  if (permission.status !== "granted") {
    throw new Error("Calendar permission is required to add SpeakUp events.");
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  if (!calendars.some((calendar) => calendar.id === preferences.calendarId)) {
    throw new Error("The selected calendar is no longer available.");
  }

  const [hour, minute] = preferences.dailyReminderTime.split(":").map(Number);
  const nextState: CalendarEvents = {
    calendarId: preferences.calendarId,
    eventIds: [],
    signature: null,
  };

  for (const day of preferences.dailyReminderDays) {
    const startDate = getNextWeekday(day, hour, minute);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
    const eventId = await Calendar.createEventAsync(preferences.calendarId, {
      alarms: [{ relativeOffset: 0 }],
      endDate,
      notes: "Your daily English lesson is ready. Keep your momentum going!",
      recurrenceRule: { frequency: Calendar.Frequency.WEEKLY, interval: 1 },
      startDate,
      title: "SpeakUp English practice",
    });
    nextState.eventIds.push(eventId);
    await saveCalendarEvents(nextState);
  }

  nextState.signature = signature;
  await saveCalendarEvents(nextState);
}

async function syncDailyReminderNow(
  preferences: DailyReminderSettings,
): Promise<boolean> {
  if (Platform.OS === "web" || Constants.expoGoConfig) return false;

  const Notifications = await import("expo-notifications");
  const [hour, minute] = preferences.dailyReminderTime.split(":").map(Number);
  const notificationIds = Array.from(
    { length: 7 },
    (_, day) => `${DAILY_REMINDER_ID}-${day}`,
  );

  for (const identifier of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  if (preferences.dailyReminder && preferences.dailyReminderDays.length > 0) {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        importance: Notifications.AndroidImportance.DEFAULT,
        name: "Daily learning",
        sound: "default",
      });
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    const permissions =
      currentPermissions.status === "granted"
        ? currentPermissions
        : await Notifications.requestPermissionsAsync();

    if (permissions.status === "granted") {
      for (const day of preferences.dailyReminderDays) {
        await Notifications.scheduleNotificationAsync({
          identifier: notificationIds[day],
          content: {
            body: "A short English lesson is ready. Keep your momentum going!",
            data: { route: "/learn" },
            sound: "default",
            title: "Time to SpeakUp",
          },
          trigger: {
            channelId: ANDROID_CHANNEL_ID,
            weekday: day + 1,
            hour,
            minute,
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          },
        });
      }
    }
  }

  if (preferences.calendarEventEnabled) {
    await syncCalendarEvents(preferences);
  } else {
    await syncCalendarEvents({
      ...preferences,
      calendarEventEnabled: false,
    });
  }

  return true;
}

export function syncDailyReminder(
  preferences: DailyReminderSettings,
): Promise<boolean> {
  const sync = reminderSyncQueue.then(() => syncDailyReminderNow(preferences));
  reminderSyncQueue = sync.then(
    () => undefined,
    () => undefined,
  );
  return sync;
}
