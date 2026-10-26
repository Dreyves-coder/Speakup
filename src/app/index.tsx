import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>YOUR DAILY ENGLISH COMPANION</Text>
            </View>

            <Image
              accessibilityLabel="SpeakUp - Learn. Speak. Level up."
              contentFit="contain"
              source={require("@/assets/logos/ChatGPT Image 15 sept. 2026, 00_08_13.png")}
              style={styles.logo}
            />
            <Text style={styles.description}>
              Build your confidence in English, one conversation at a time.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("./get-started")}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Text style={styles.arrow}>{"\u2192"}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("./login")}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                I already have an account
              </Text>
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
      "linear-gradient(155deg, #07142F 0%, #102B66 48%, #331A70 100%)",
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.24)",
    borderRadius: 999,
    backgroundColor: "rgba(8, 28, 65, 0.48)",
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4DE8E8",
  },
  eyebrowText: {
    color: "#B9F5F5",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  logo: {
    width: "100%",
    maxWidth: 300,
    aspectRatio: 1303 / 1207,
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    maxWidth: 330,
    marginTop: 14,
    color: "#C4D2EE",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    gap: 12,
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
    shadowColor: "#4438CA",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.36,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  secondaryButtonText: {
    color: "#DCE7FF",
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(77, 232, 232, 0.12)",
  },
  glowTop: {
    top: -110,
    right: -100,
  },
  glowBottom: {
    bottom: 60,
    left: -170,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
});
