import { OnboardingProgressHeader } from "@/components/onboarding-progress-header";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAILY_GOALS = [
  { minutes: 5, label: "A quick start", detail: "Keep it light and consistent" },
  { minutes: 10, label: "Build a habit", detail: "A balanced daily rhythm" },
  { minutes: 15, label: "Make progress", detail: "Move forward more quickly" },
  { minutes: 20, label: "Challenge myself", detail: "For ambitious learners" },
] as const;

type DailyGoal = (typeof DAILY_GOALS)[number]["minutes"];

export default function DailyGoalScreen() {
  const [selectedGoal, setSelectedGoal] = useState<DailyGoal>(10);

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glow} />

      <SafeAreaView style={styles.safeArea}>
        <OnboardingProgressHeader
          currentStep={1}
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.eyebrow}>YOUR DAILY GOAL</Text>
            <Text style={styles.title}>How much time can you practice?</Text>
            <Text style={styles.description}>
              A little every day is the fastest way to build confidence.
            </Text>

            <View style={styles.options}>
              {DAILY_GOALS.map((goal) => {
                const isSelected = selectedGoal === goal.minutes;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={goal.minutes}
                    onPress={() => setSelectedGoal(goal.minutes)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.minutesBadge,
                        isSelected && styles.minutesBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.minutes,
                          isSelected && styles.minutesSelected,
                        ]}
                      >
                        {goal.minutes}
                      </Text>
                      <Text
                        style={[
                          styles.minutesUnit,
                          isSelected && styles.minutesSelected,
                        ]}
                      >
                        min
                      </Text>
                    </View>

                    <View style={styles.optionCopy}>
                      <Text style={styles.optionLabel}>{goal.label}</Text>
                      <Text style={styles.optionDetail}>{goal.detail}</Text>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/level",
                params: { goal: selectedGoal },
              })
            }
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>{"\u2192"}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#07142F",
    experimental_backgroundImage:
      "linear-gradient(155deg, #07142F 0%, #102B66 52%, #28165F 100%)",
    overflow: "hidden",
  },
  safeArea: { flex: 1 },
  glow: {
    position: "absolute",
    top: 120,
    right: -170,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(77, 232, 232, 0.09)",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  eyebrow: {
    color: "#67E8F9",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    maxWidth: 340,
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  description: {
    maxWidth: 350,
    marginTop: 12,
    color: "#B7C7E5",
    fontSize: 16,
    lineHeight: 23,
  },
  options: { gap: 12, marginTop: 30 },
  option: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  optionSelected: {
    borderColor: "#67E8F9",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  minutesBadge: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  minutesBadgeSelected: { backgroundColor: "#FFFFFF" },
  minutes: { color: "#FFFFFF", fontSize: 20, lineHeight: 22, fontWeight: "800" },
  minutesUnit: { color: "#AFC0E0", fontSize: 10, fontWeight: "700" },
  minutesSelected: { color: "#3157D5" },
  optionCopy: { flex: 1, marginHorizontal: 14 },
  optionLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  optionDetail: { marginTop: 4, color: "#AFC0E0", fontSize: 13 },
  radio: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#647596",
    borderRadius: 11,
  },
  radioSelected: { borderColor: "#67E8F9" },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#67E8F9",
  },
  continueButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#5A5CF6",
    experimental_backgroundImage:
      "linear-gradient(100deg, #3B82F6 0%, #7458F5 58%, #8B5CF6 100%)",
  },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  continueArrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
