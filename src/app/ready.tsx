import { OnboardingProgressHeader } from "@/components/onboarding-progress-header";
import {
  ENGLISH_LEVELS,
  isDailyGoal,
  isEnglishLevel,
} from "@/constants/user-preferences";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReadyScreen() {
  const { updatePreferences } = useUserPreferences();
  const { goal, level } = useLocalSearchParams<{
    goal?: string;
    level?: string;
  }>();

  const parsedGoal = Number(goal);
  const dailyGoal = isDailyGoal(parsedGoal) ? parsedGoal : 10;
  const levelId = isEnglishLevel(level) ? level : "unknown";
  const selectedLevel = ENGLISH_LEVELS[levelId];

  function handleCreateAccount() {
    updatePreferences({ dailyGoal, englishLevel: levelId });
    router.push("./register");
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView style={styles.safeArea}>
        <OnboardingProgressHeader
          currentStep={3}
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.successRing}>
              <View style={styles.successCircle}>
                <Text style={styles.check}>{"\u2713"}</Text>
              </View>
            </View>

            <Text style={styles.eyebrow}>YOUR PLAN IS READY</Text>
            <Text style={styles.title}>{"You're ready to SpeakUp."}</Text>
            <Text style={styles.description}>
              We have the foundation for a learning path that fits your rhythm.
            </Text>
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeValue}>{dailyGoal}</Text>
                <Text style={styles.summaryBadgeUnit}>min</Text>
              </View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>Daily practice</Text>
                <Text style={styles.summaryValue}>Every day</Text>
              </View>
              <Text style={styles.done}>{"\u2713"}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={[styles.summaryBadge, styles.levelBadge]}>
                <Text style={styles.levelCode}>{selectedLevel.code}</Text>
              </View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryLabel}>Starting level</Text>
                <Text style={styles.summaryValue}>{selectedLevel.label}</Text>
              </View>
              <Text style={styles.done}>{"\u2713"}</Text>
            </View>
          </View>

          <Text style={styles.note}>
            You will be able to update these choices from your profile later.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={handleCreateAccount}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Create my account</Text>
              <Text style={styles.arrow}>{"\u2192"}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Review my level</Text>
            </Pressable>
          </View>
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
      "linear-gradient(155deg, #07142F 0%, #102B66 50%, #331A70 100%)",
    overflow: "hidden",
  },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  hero: { alignItems: "center" },
  successRing: {
    width: 106,
    height: 106,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.24)",
    borderRadius: 53,
    backgroundColor: "rgba(103, 232, 249, 0.08)",
  },
  successCircle: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 39,
    backgroundColor: "#52D7D6",
    experimental_backgroundImage:
      "linear-gradient(135deg, #67E8F9 0%, #3B82F6 100%)",
  },
  check: { color: "#FFFFFF", fontSize: 40, lineHeight: 44, fontWeight: "800" },
  eyebrow: {
    marginTop: 24,
    color: "#67E8F9",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "center",
  },
  description: {
    maxWidth: 350,
    marginTop: 12,
    color: "#B7C7E5",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
  summary: {
    width: "100%",
    maxWidth: 440,
    marginTop: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.13)",
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  summaryRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryBadge: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(103, 232, 249, 0.14)",
  },
  summaryBadgeValue: {
    color: "#67E8F9",
    fontSize: 19,
    lineHeight: 21,
    fontWeight: "900",
  },
  summaryBadgeUnit: { color: "#A5EFF2", fontSize: 10, fontWeight: "700" },
  levelBadge: { backgroundColor: "rgba(139, 92, 246, 0.2)" },
  levelCode: { color: "#C4B5FD", fontSize: 17, fontWeight: "900" },
  summaryCopy: { flex: 1, marginHorizontal: 14 },
  summaryLabel: { color: "#AFC0E0", fontSize: 12, fontWeight: "600" },
  summaryValue: { marginTop: 4, color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  done: { color: "#67E8F9", fontSize: 20, fontWeight: "800" },
  divider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  note: {
    maxWidth: 330,
    marginTop: 18,
    color: "#91A5CA",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 440,
    marginTop: "auto",
    paddingTop: 30,
    gap: 10,
  },
  primaryButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#5A5CF6",
    experimental_backgroundImage:
      "linear-gradient(100deg, #3B82F6 0%, #7458F5 58%, #8B5CF6 100%)",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  arrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  secondaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  secondaryButtonText: { color: "#DCE7FF", fontSize: 14, fontWeight: "700" },
  secondaryPressed: { backgroundColor: "rgba(255, 255, 255, 0.06)" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowTop: {
    top: 80,
    right: -180,
    backgroundColor: "rgba(77, 232, 232, 0.1)",
  },
  glowBottom: {
    bottom: -130,
    left: -130,
    backgroundColor: "rgba(139, 92, 246, 0.18)",
  },
});
