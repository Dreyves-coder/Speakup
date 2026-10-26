import { AuthFormField } from "@/components/auth-form-field";
import { AuthScreenLayout } from "@/components/auth-screen-layout";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/api-client";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type LoginForm = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginForm, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof LoginForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleLogin() {
    const nextErrors: LoginErrors = {};

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Enter your password.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await login(form.email, form.password);
      router.replace("/home");
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Unable to reach SpeakUp. Check that the API is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenLayout
      description="Continue building your English confidence."
      eyebrow="WELCOME BACK"
      title="Sign in to SpeakUp"
    >
      <View style={styles.form}>
        <AuthFormField
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          keyboardType="email-address"
          label="Email address"
          onChangeText={(value) => updateField("email", value)}
          placeholder="you@example.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={form.email}
        />

        <AuthFormField
          autoCapitalize="none"
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onChangeText={(value) => updateField("password", value)}
          placeholder="Your password"
          returnKeyType="done"
          secureTextEntry
          textContentType="password"
          value={form.password}
        />

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() =>
            void Linking.openURL(
              "mailto:support@speakup.app?subject=SpeakUp account access",
            )
          }
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Need help signing in?</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Sign in</Text>
              <Text style={styles.arrow}>{"\u2192"}</Text>
            </>
          )}
        </Pressable>
        {submitError && <Text style={styles.submitError}>{submitError}</Text>}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to SpeakUp?</Text>
        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() => router.replace("/register")}
        >
          <Text style={styles.footerLink}>Create an account</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 18 },
  forgotButton: { alignSelf: "flex-end", marginTop: -6 },
  forgotText: { color: "#8CDDE7", fontSize: 13, fontWeight: "700" },
  primaryButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
    paddingHorizontal: 24,
    borderRadius: 18,
    backgroundColor: "#5A5CF6",
    experimental_backgroundImage:
      "linear-gradient(100deg, #3B82F6 0%, #7458F5 58%, #8B5CF6 100%)",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  arrow: { color: "#FFFFFF", fontSize: 22, fontWeight: "600" },
  submitError: {
    color: "#FFB4BC",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 30,
  },
  footerText: { color: "#AFC0E0", fontSize: 14 },
  footerLink: { color: "#67E8F9", fontSize: 14, fontWeight: "800" },
});
