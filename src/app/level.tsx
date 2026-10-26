import { OnboardingProgressHeader } from "@/components/onboarding-progress-header";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ENGLISH_LEVELS = [
  {
    id: "a1",
    code: "A1",
    title: "Beginner",
    detail: "I know a few words and simple phrases",
  },
  {
    id: "a2",
    code: "A2",
    title: "Elementary",
    detail: "I can handle familiar everyday situations",
  },
  {
    id: "b1",
    code: "B1",
    title: "Intermediate",
    detail: "I can discuss familiar topics with some ease",
  },
  {
    id: "b2-plus",
    code: "B2+",
    title: "Upper intermediate",
    detail: "I can communicate clearly on many topics",
  },
  {
    id: "unknown",
    code: "?",
    title: "Take the quick test",
    detail: "Answer five questions to estimate my starting point",
  },
] as const;

type EnglishLevel = (typeof ENGLISH_LEVELS)[number]["id"];

export default function LevelScreen() {
  const { goal } = useLocalSearchParams<{ goal?: string }>();
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | null>(null);

  function continueOnboarding() {
    if (!selectedLevel) return;
    if (selectedLevel === "unknown") {
      router.push({
        pathname: "/placement-test",
        params: { goal: goal ?? "10" },
      });
      return;
    }

    router.push({
      pathname: "/ready",
      params: { goal: goal ?? "10", level: selectedLevel },
    });
  }

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.glow} />

      <SafeAreaView style={styles.safeArea}>
        <OnboardingProgressHeader
          currentStep={2}
          onBack={() => router.back()}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={styles.eyebrow}>YOUR ENGLISH LEVEL</Text>
            <Text style={styles.title}>Where are you starting from?</Text>
            <Text style={styles.description}>
              Choose the option that feels closest. You can change it later.
            </Text>

            <View accessibilityRole="radiogroup" style={styles.options}>
              {ENGLISH_LEVELS.map((level) => {
                const isSelected = selectedLevel === level.id;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    key={level.id}
                    onPress={() => setSelectedLevel(level.id)}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.levelBadge,
                        isSelected && styles.levelBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.levelCode,
                          isSelected && styles.levelCodeSelected,
                        ]}
                      >
                        {level.code}
                      </Text>
                    </View>

                    <View style={styles.optionCopy}>
                      <Text style={styles.optionTitle}>{level.title}</Text>
                      <Text style={styles.optionDetail}>{level.detail}</Text>
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
            accessibilityState={{ disabled: selectedLevel === null }}
            disabled={selectedLevel === null}
            onPress={continueOnboarding}
            style={({ pressed }) => [
              styles.continueButton,
              selectedLevel === null && styles.continueButtonDisabled,
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
    bottom: 70,
    left: -180,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(139, 92, 246, 0.16)",
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 36,
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
  options: { gap: 10, marginTop: 26 },
  option: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  optionSelected: {
    borderColor: "#67E8F9",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  levelBadge: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  levelBadgeSelected: { backgroundColor: "#FFFFFF" },
  levelCode: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  levelCodeSelected: { color: "#3157D5" },
  optionCopy: { flex: 1, marginHorizontal: 13 },
  optionTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  optionDetail: {
    marginTop: 3,
    color: "#AFC0E0",
    fontSize: 12,
    lineHeight: 17,
  },
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
    marginTop: 30,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#5A5CF6",
    experimental_backgroundImage:
      "linear-gradient(100deg, #3B82F6 0%, #7458F5 58%, #8B5CF6 100%)",
  },
  continueButtonDisabled: {
    backgroundColor: "#394364",
    experimental_backgroundImage: "linear-gradient(#394364, #394364)",
    opacity: 0.65,
  },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  continueArrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
