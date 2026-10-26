import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const DAILY_REMINDER_ID = "speakup-daily-reminder";
const ANDROID_CHANNEL_ID = "daily-learning";

export function configureNotificationHandling() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function syncDailyReminder(enabled: boolean): Promise<boolean> {
  if (Platform.OS === "web") return false;

  await Notifications.cancelScheduledNotificationAsync(
    DAILY_REMINDER_ID,
  ).catch(() => undefined);

  if (!enabled) return true;

  const currentPermissions = await Notifications.getPermissionsAsync();
  const permissions =
    currentPermissions.status === "granted"
      ? currentPermissions
      : await Notifications.requestPermissionsAsync();

  if (permissions.status !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: "Daily learning",
      sound: "default",
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      body: "A short English lesson is ready. Keep your momentum going!",
      data: { route: "/learn" },
      sound: "default",
      title: "Time to SpeakUp",
    },
    trigger: {
      channelId: ANDROID_CHANNEL_ID,
      hour: 19,
      minute: 0,
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
    },
  });

  return true;
}
