import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenLayoutProps = {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AuthScreenLayout({
  children,
  description,
  eyebrow,
  title,
}: AuthScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={[styles.glow, styles.glowTop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowBottom]} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.backIcon}>{"\u2190"}</Text>
          </Pressable>

          <Text style={styles.brand}>
            Speak<Text style={styles.brandAccent}>Up</Text>
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>

            {children}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
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
  brand: {
    flex: 1,
    marginRight: 42,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  brandAccent: { color: "#8067FF" },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 28,
  },
  heading: { marginBottom: 28 },
  eyebrow: {
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
  },
  description: {
    marginTop: 10,
    color: "#B7C7E5",
    fontSize: 15,
    lineHeight: 22,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  glow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowTop: {
    top: -160,
    right: -130,
    backgroundColor: "rgba(77, 232, 232, 0.11)",
  },
  glowBottom: {
    bottom: -150,
    left: -160,
    backgroundColor: "rgba(139, 92, 246, 0.18)",
  },
});
