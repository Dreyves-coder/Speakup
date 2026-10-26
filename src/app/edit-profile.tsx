import { DAILY_GOALS, ENGLISH_LEVELS } from "@/constants/user-preferences";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import type { DailyGoal, EnglishLevelId } from "@/types/user-preferences";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const { preferences, updatePreferences } = useUserPreferences();
  const [displayName, setDisplayName] = useState(preferences.displayName);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(preferences.dailyGoal);
  const [englishLevel, setEnglishLevel] = useState<EnglishLevelId>(
    preferences.englishLevel,
  );

  function save() {
    const name = displayName.trim();
    if (!name) return;
    updatePreferences({ dailyGoal, displayName: name, englishLevel });
    router.back();
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{"‹"}</Text>
          </Pressable>
          <Text style={styles.title}>Edit profile</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            autoCapitalize="words"
            maxLength={60}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="#8492AA"
            style={styles.input}
            value={displayName}
          />

          <Text style={styles.label}>DAILY GOAL</Text>
          <View style={styles.options}>
            {DAILY_GOALS.map((goal) => (
              <Pressable
                key={goal}
                onPress={() => setDailyGoal(goal)}
                style={[
                  styles.option,
                  dailyGoal === goal && styles.optionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    dailyGoal === goal && styles.optionTextSelected,
                  ]}
                >
                  {goal} min
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>ENGLISH LEVEL</Text>
          <View style={styles.levels}>
            {(Object.keys(ENGLISH_LEVELS) as EnglishLevelId[]).map((id) => {
              const level = ENGLISH_LEVELS[id];
              return (
                <Pressable
                  key={id}
                  onPress={() => setEnglishLevel(id)}
                  style={[
                    styles.levelOption,
                    englishLevel === id && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.levelCode,
                      englishLevel === id && styles.optionTextSelected,
                    ]}
                  >
                    {level.code}
                  </Text>
                  <Text style={styles.levelLabel}>{level.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            disabled={!displayName.trim()}
            onPress={save}
            style={[
              styles.saveButton,
              !displayName.trim() && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveText}>Save changes</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FF" },
  safeArea: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 20 },
  backButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#FFFFFF" },
  backText: { color: "#52637F", fontSize: 30, lineHeight: 32 },
  title: { marginLeft: 14, color: "#132442", fontSize: 22, fontWeight: "900" },
  content: { width: "100%", maxWidth: 540, alignSelf: "center", padding: 22 },
  label: { marginTop: 20, marginBottom: 9, color: "#7585A2", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  input: { minHeight: 58, paddingHorizontal: 16, borderWidth: 1, borderColor: "#DDE5F1", borderRadius: 17, backgroundColor: "#FFFFFF", color: "#172746", fontSize: 16, fontWeight: "700" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  option: { paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#DDE5F1", borderRadius: 14, backgroundColor: "#FFFFFF" },
  optionSelected: { borderColor: "#5365E8", backgroundColor: "#EDF2FF" },
  optionText: { color: "#60708E", fontSize: 13, fontWeight: "800" },
  optionTextSelected: { color: "#4D5FD6" },
  levels: { gap: 9 },
  levelOption: { minHeight: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderWidth: 1, borderColor: "#DDE5F1", borderRadius: 16, backgroundColor: "#FFFFFF" },
  levelCode: { width: 48, color: "#5363C9", fontSize: 15, fontWeight: "900" },
  levelLabel: { color: "#52637F", fontSize: 13, fontWeight: "700" },
  saveButton: { minHeight: 57, alignItems: "center", justifyContent: "center", marginTop: 32, borderRadius: 18, backgroundColor: "#5365E8" },
  saveButtonDisabled: { backgroundColor: "#C7D0DF" },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
