import { TabPageHeader } from "@/components/tab-page-header";
import { TabScreen } from "@/components/tab-screen";
import { ENGLISH_LEVELS } from "@/constants/user-preferences";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { getWritableCalendars } from "@/services/daily-reminder";
import { getProgress } from "@/services/learning-api";
import type { ProgressSnapshot } from "@/types/learning-progress";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Calendar as DeviceCalendar } from "expo-calendar/legacy";

const REMINDER_DAYS = [
  { label: "Sun", day: 0 },
  { label: "Mon", day: 1 },
  { label: "Tue", day: 2 },
  { label: "Wed", day: 3 },
  { label: "Thu", day: 4 },
  { label: "Fri", day: 5 },
  { label: "Sat", day: 6 },
] as const;

type SwitchRowProps = {
  description: string;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

function SwitchRow({
  description,
  label,
  onValueChange,
  value,
}: SwitchRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        ios_backgroundColor="#D5DDE9"
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: "#D5DDE9", true: "#4C7FE7" }}
        value={value}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const { deleteAccount, logout, session } = useAuth();
  const { preferences, syncStatus, updatePreferences } = useUserPreferences();
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [timeInputVersion, setTimeInputVersion] = useState(0);
  const [calendarOptions, setCalendarOptions] = useState<DeviceCalendar[]>([]);
  const [isCalendarPickerVisible, setCalendarPickerVisible] = useState(false);
  const [isLoadingCalendars, setLoadingCalendars] = useState(false);
  const level = ENGLISH_LEVELS[preferences.englishLevel];
  const selectedCalendar = calendarOptions.find(
    (calendar) => calendar.id === preferences.calendarId,
  );
  const initials = preferences.displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const learningPreferences = [
    {
      label: "Daily goal",
      value: preferences.dailyGoal.toString() + " minutes",
    },
    {
      label: "English level",
      value: level.code + " " + level.label,
    },
    { label: "Learning focus", value: "Everyday English" },
  ];
  const syncLabel = {
    local: "LOCAL MODE",
    synced: "SYNCED",
    syncing: "SYNCING",
  }[syncStatus];
  const profileStats = [
    { label: "LESSONS", value: String(progress?.lessonsCompleted ?? 0) },
    { label: "STREAK", value: `${progress?.streakDays ?? 0} days` },
    { label: "XP", value: String(progress?.totalXp ?? 0) },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (session) {
        void getProgress(session.accessToken, session.user.id).then((value) => {
          if (isActive) setProgress(value);
        });
      }
      return () => {
        isActive = false;
      };
    }, [session]),
  );

  function handleSignOut() {
    Alert.alert(
      "Sign out?",
      "Your local progress will remain available on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/");
          },
        },
      ],
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account permanently?",
      "Your profile, preferences and synced lesson results will be deleted. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            await deleteAccount();
            router.replace("/");
          },
        },
      ],
    );
  }

  async function handleChooseCalendar() {
    setLoadingCalendars(true);
    try {
      const calendars = await getWritableCalendars();
      if (calendars.length === 0) {
        Alert.alert(
          "No writable calendar",
          "Allow calendar access and make sure your device has a writable calendar. This feature requires the SpeakUp development build, not Expo Go.",
        );
        return;
      }
      setCalendarOptions(calendars);
      setCalendarPickerVisible(true);
    } catch (error) {
      console.error("Could not load device calendars.", error);
      Alert.alert(
        "Calendar unavailable",
        "SpeakUp could not access your calendars. Check the permission in your device settings and try again.",
      );
    } finally {
      setLoadingCalendars(false);
    }
  }

  function handleReminderTimeBlur(value: string) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
      Alert.alert("Invalid time", "Enter a time in 24-hour format, such as 19:00.");
      setTimeInputVersion((version) => version + 1);
      return;
    }
    if (value !== preferences.dailyReminderTime) {
      updatePreferences({ dailyReminderTime: value });
    }
  }

  function toggleReminderDay(day: number) {
    const selected = preferences.dailyReminderDays.includes(day);
    if (selected && preferences.dailyReminderDays.length === 1) {
      Alert.alert("Choose at least one day", "A reminder needs at least one selected day.");
      return;
    }
    updatePreferences({
      dailyReminderDays: selected
        ? preferences.dailyReminderDays.filter((value) => value !== day)
        : [...preferences.dailyReminderDays, day].sort((a, b) => a - b),
    });
  }

  return (
    <TabScreen>
        <TabPageHeader
          eyebrow="YOUR ACCOUNT"
          title="Profile"
          right={<Pressable
            accessibilityRole="button"
            onPress={() => router.push("/edit-profile")}
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>}
        />

        <View style={styles.profileCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{preferences.displayName}</Text>
          <Text style={styles.profileEmail}>
            {session?.user.email ?? ""}
          </Text>
          <View style={styles.profileBadges}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {level.code} / {level.label}
              </Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>FREE</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          {profileStats.map((stat, index) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              {index < profileStats.length - 1 && (
                <View style={styles.statDivider} />
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Learning preferences</Text>
        <View style={styles.card}>
          {learningPreferences.map((preference, index) => (
            <Pressable
              accessibilityRole="button"
              key={preference.label}
              onPress={() => router.push("/edit-profile")}
              style={({ pressed }) => [
                styles.preferenceRow,
                index < learningPreferences.length - 1 && styles.rowBorder,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.preferenceCopy}>
                <Text style={styles.preferenceLabel}>{preference.label}</Text>
                <Text style={styles.preferenceValue}>{preference.value}</Text>
              </View>
              <Text style={styles.chevron}>{"\u203A"}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitleNoMargin}>App preferences</Text>
          <Text style={styles.previewLabel}>{syncLabel}</Text>
        </View>
        <View style={styles.card}>
          <SwitchRow
            description={`Daily learning reminder at ${preferences.dailyReminderTime}`}
            label="Daily reminder"
            onValueChange={(dailyReminder) =>
              updatePreferences({ dailyReminder })
            }
            value={preferences.dailyReminder}
          />
          <View style={styles.rowDivider} />
          <View style={styles.reminderControls}>
            <Text style={styles.settingLabel}>Reminder time</Text>
            <TextInput
              accessibilityLabel="Reminder time in 24-hour format"
              defaultValue={preferences.dailyReminderTime}
              key={`${preferences.dailyReminderTime}-${timeInputVersion}`}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
              onEndEditing={(event) =>
                handleReminderTimeBlur(event.nativeEvent.text)
              }
              placeholder="19:00"
              style={styles.timeInput}
            />
          </View>
          <View style={styles.dayPicker}>
            <Text style={styles.settingLabel}>Repeat on</Text>
            <View style={styles.weekdayRow}>
              {REMINDER_DAYS.map(({ day, label }) => {
                const isSelected = preferences.dailyReminderDays.includes(day);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    key={day}
                    onPress={() => toggleReminderDay(day)}
                    style={[
                      styles.weekdayChip,
                      isSelected && styles.weekdayChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayChipText,
                        isSelected && styles.weekdayChipTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.rowDivider} />
          <SwitchRow
            description="Add a recurring event to a calendar on this device"
            label="Add to calendar"
            onValueChange={(enabled) => {
              if (enabled) {
                void handleChooseCalendar();
              } else {
                updatePreferences({ calendarEventEnabled: false });
              }
            }}
            value={preferences.calendarEventEnabled}
          />
          <Pressable
            accessibilityRole="button"
            disabled={isLoadingCalendars}
            onPress={() => void handleChooseCalendar()}
            style={({ pressed }) => [
              styles.calendarPickerButton,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.preferenceLabel}>
              {isLoadingCalendars
                ? "Loading calendars..."
                : selectedCalendar?.title ?? "Choose a calendar"}
            </Text>
            <Text style={styles.chevron}>{"\u203A"}</Text>
          </Pressable>
          <Modal
            animationType="slide"
            onRequestClose={() => setCalendarPickerVisible(false)}
            transparent
            visible={isCalendarPickerVisible}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.calendarModal}>
                <Text style={styles.calendarModalTitle}>Choose a calendar</Text>
                <ScrollView>
                  {calendarOptions.map((calendar) => (
                    <Pressable
                      accessibilityRole="button"
                      key={calendar.id}
                      onPress={() => {
                        updatePreferences({
                          calendarEventEnabled: true,
                          calendarId: calendar.id,
                        });
                        setCalendarPickerVisible(false);
                      }}
                      style={({ pressed }) => [
                        styles.calendarOption,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.calendarColor,
                          { backgroundColor: calendar.color },
                        ]}
                      />
                      <View style={styles.calendarOptionCopy}>
                        <Text style={styles.preferenceLabel}>{calendar.title}</Text>
                        <Text style={styles.settingDescription}>
                          {calendar.source?.name ?? "Device calendar"}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setCalendarPickerVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <View style={styles.rowDivider} />
          <SwitchRow
            description="Play spoken prompts during conversation practice"
            label="Sound effects"
            onValueChange={(soundEffects) =>
              updatePreferences({ soundEffects })
            }
            value={preferences.soundEffects}
          />
          <View style={styles.rowDivider} />
          <SwitchRow
            description="Use touch feedback for answers and results"
            label="Haptic feedback"
            onValueChange={(hapticFeedback) =>
              updatePreferences({ hapticFeedback })
            }
            value={preferences.hapticFeedback}
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/support")}
            style={({ pressed }) => [
              styles.simpleRow,
              styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.simpleRowText}>Help center</Text>
            <Text style={styles.chevron}>{"\u203A"}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/support")}
            style={({ pressed }) => [styles.simpleRow, pressed && styles.rowPressed]}
          >
            <Text style={styles.simpleRowText}>Privacy and terms</Text>
            <Text style={styles.chevron}>{"\u203A"}</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={handleDeleteAccount}
          style={({ pressed }) => [
            styles.deleteAccountButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.deleteAccountText}>Delete account</Text>
        </Pressable>

        <Text style={styles.version}>SpeakUp mobile / 1.0.0</Text>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#DCE5F2",
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },
  editButtonText: { color: "#3C6ED4", fontSize: 12, fontWeight: "800" },
  profileCard: {
    alignItems: "center",
    marginTop: 23,
    padding: 22,
    borderRadius: 25,
    backgroundColor: "#1F3C88",
    experimental_backgroundImage:
      "linear-gradient(140deg, #183B83 0%, #3C55BA 54%, #704ACB 100%)",
    shadowColor: "#29448D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 17,
    elevation: 5,
  },
  avatarRing: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 44,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  avatar: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: "#FFFFFF",
  },
  avatarText: { color: "#5361CE", fontSize: 22, fontWeight: "900" },
  profileName: { marginTop: 14, color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  profileEmail: { marginTop: 4, color: "#D0DDF8", fontSize: 12 },
  profileBadges: { flexDirection: "row", gap: 8, marginTop: 15 },
  levelBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(103, 232, 249, 0.18)",
  },
  levelBadgeText: { color: "#B0F4F4", fontSize: 10, fontWeight: "800" },
  planBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  planBadgeText: { color: "#E6ECFF", fontSize: 10, fontWeight: "800" },
  statsCard: {
    flexDirection: "row",
    marginTop: 13,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { color: "#172746", fontSize: 19, fontWeight: "900" },
  statLabel: { marginTop: 3, color: "#8190AA", fontSize: 9, fontWeight: "600" },
  statDivider: {
    position: "absolute",
    top: 4,
    right: 0,
    width: 1,
    height: 36,
    backgroundColor: "#E7ECF3",
  },
  sectionTitle: {
    marginTop: 27,
    marginBottom: 11,
    color: "#10203E",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 27,
    marginBottom: 11,
  },
  sectionTitleNoMargin: { color: "#10203E", fontSize: 18, fontWeight: "900" },
  previewLabel: {
    color: "#168D8A",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  card: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7F2",
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },
  preferenceRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  preferenceCopy: { flex: 1 },
  preferenceLabel: { color: "#263754", fontSize: 13, fontWeight: "800" },
  preferenceValue: { marginTop: 3, color: "#8190A9", fontSize: 11 },
  chevron: { color: "#8694AC", fontSize: 24, fontWeight: "500" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#EDF1F6" },
  rowPressed: { backgroundColor: "#F4F7FB" },
  settingRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  settingCopy: { flex: 1, paddingRight: 14 },
  settingLabel: { color: "#263754", fontSize: 13, fontWeight: "800" },
  settingDescription: { marginTop: 3, color: "#8190A9", fontSize: 10, lineHeight: 14 },
  reminderControls: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  timeInput: {
    minWidth: 82,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#DCE5F2",
    borderRadius: 10,
    color: "#263754",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  dayPicker: { paddingHorizontal: 15, paddingVertical: 13 },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 11,
  },
  weekdayChip: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DCE5F2",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
  },
  weekdayChipSelected: { borderColor: "#4C7FE7", backgroundColor: "#4C7FE7" },
  weekdayChipText: { color: "#677792", fontSize: 10, fontWeight: "700" },
  weekdayChipTextSelected: { color: "#FFFFFF" },
  calendarPickerButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(6, 18, 40, 0.48)",
  },
  calendarModal: {
    maxHeight: "75%",
    paddingTop: 22,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  calendarModalTitle: {
    marginHorizontal: 20,
    marginBottom: 12,
    color: "#10203E",
    fontSize: 18,
    fontWeight: "900",
  },
  calendarOption: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  calendarColor: { width: 13, height: 13, marginRight: 13, borderRadius: 7 },
  calendarOptionCopy: { flex: 1 },
  modalCloseButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 12,
    minHeight: 45,
    borderRadius: 12,
    backgroundColor: "#F0F4FA",
  },
  modalCloseText: { color: "#3C6ED4", fontSize: 13, fontWeight: "800" },
  rowDivider: { height: 1, marginLeft: 15, backgroundColor: "#EDF1F6" },
  simpleRow: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  simpleRowText: { flex: 1, color: "#263754", fontSize: 13, fontWeight: "700" },
  signOutButton: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#F0CDD2",
    borderRadius: 17,
    backgroundColor: "#FFF5F6",
  },
  signOutText: { color: "#C64F5D", fontSize: 13, fontWeight: "800" },
  deleteAccountButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  deleteAccountText: { color: "#9A6670", fontSize: 11, fontWeight: "700" },
  version: { marginTop: 17, color: "#96A2B6", fontSize: 10, textAlign: "center" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
