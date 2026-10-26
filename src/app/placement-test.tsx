import { OnboardingProgressHeader } from "@/components/onboarding-progress-header";
import type { EnglishLevelId } from "@/types/user-preferences";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QUESTIONS = [
  { prompt: "I ___ from France.", options: ["am", "is", "be"], answer: "am" },
  { prompt: "She ___ coffee every morning.", options: ["drink", "drinks", "drinking"], answer: "drinks" },
  { prompt: "If I had more time, I ___ another language.", options: ["learn", "would learn", "learned yesterday"], answer: "would learn" },
  { prompt: "Choose the natural sentence.", options: ["I've worked here since 2024.", "I work here since 2024.", "I am work here from 2024."], answer: "I've worked here since 2024." },
  { prompt: "The release was delayed, ___ the team had completed testing.", options: ["although", "because of", "unless that"], answer: "although" },
] as const;

function levelFromScore(score: number): EnglishLevelId {
  if (score <= 1) return "a1";
  if (score === 2) return "a2";
  if (score <= 4) return "b1";
  return "b2-plus";
}

export default function PlacementTestScreen() {
  const { goal } = useLocalSearchParams<{ goal?: string }>();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const question = QUESTIONS[index];

  function next() {
    if (!selected) return;
    const nextScore = score + (selected === question.answer ? 1 : 0);

    if (index === QUESTIONS.length - 1) {
      router.replace({
        pathname: "/ready",
        params: {
          goal: goal ?? "10",
          level: levelFromScore(nextScore),
        },
      });
      return;
    }

    setScore(nextScore);
    setIndex((current) => current + 1);
    setSelected(null);
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingProgressHeader currentStep={2} onBack={() => router.back()} />
        <View style={styles.content}>
          <View>
            <Text style={styles.eyebrow}>QUICK LEVEL CHECK</Text>
            <Text style={styles.counter}>
              Question {index + 1} of {QUESTIONS.length}
            </Text>
            <Text style={styles.prompt}>{question.prompt}</Text>
            <View style={styles.options}>
              {question.options.map((option) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected === option }}
                  key={option}
                  onPress={() => setSelected(option)}
                  style={[
                    styles.option,
                    selected === option && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable
            disabled={!selected}
            onPress={next}
            style={[
              styles.continueButton,
              !selected && styles.continueButtonDisabled,
            ]}
          >
            <Text style={styles.continueText}>
              {index === QUESTIONS.length - 1 ? "See my level" : "Next question"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#07142F", experimental_backgroundImage: "linear-gradient(155deg, #07142F 0%, #102B66 52%, #28165F 100%)" },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: "space-between", width: "100%", maxWidth: 520, alignSelf: "center", padding: 24 },
  eyebrow: { color: "#67E8F9", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  counter: { marginTop: 14, color: "#AFC0E0", fontSize: 13, fontWeight: "700" },
  prompt: { marginTop: 24, color: "#FFFFFF", fontSize: 28, lineHeight: 37, fontWeight: "900" },
  options: { gap: 11, marginTop: 28 },
  option: { minHeight: 62, justifyContent: "center", padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", borderRadius: 18, backgroundColor: "rgba(255,255,255,0.07)" },
  optionSelected: { borderColor: "#67E8F9", backgroundColor: "rgba(59,130,246,0.22)" },
  optionText: { color: "#DCE7FF", fontSize: 15, fontWeight: "700" },
  optionTextSelected: { color: "#FFFFFF" },
  continueButton: { minHeight: 58, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: "#5A5CF6" },
  continueButtonDisabled: { backgroundColor: "#394364", opacity: 0.65 },
  continueText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
});
