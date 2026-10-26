import { Pressable, StyleSheet, Text, View } from "react-native";

type OnboardingProgressHeaderProps = {
  currentStep: number;
  onBack: () => void;
  totalSteps?: number;
};

export function OnboardingProgressHeader({
  currentStep,
  onBack,
  totalSteps = 3,
}: OnboardingProgressHeaderProps) {
  const progress = `${(currentStep / totalSteps) * 100}%` as `${number}%`;

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.backIcon}>{"\u2190"}</Text>
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressValue, { width: progress }]} />
      </View>

      <Text style={styles.step}>
        {currentStep} / {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  backIcon: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  progressTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  progressValue: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#54E3E3",
  },
  step: { color: "#AFC0E0", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
