import { AuthFormField } from "@/components/auth-form-field";
import { AuthScreenLayout } from "@/components/auth-screen-layout";
import { useAuth } from "@/hooks/use-auth";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { ApiError } from "@/services/api-client";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const { register } = useAuth();
  const { preferences, updatePreferences } = useUserPreferences();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleRegister() {
    const nextErrors: RegisterErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (form.passwordConfirmation !== form.password) {
      nextErrors.passwordConfirmation = "The passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const displayName = form.name.trim();
      await register(form.email, form.password, {
        ...preferences,
        displayName,
      });
      updatePreferences({ displayName });
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
      description="Create your profile and keep your future progress in one place."
      eyebrow="JOIN SPEAKUP"
      title="Create your account"
    >
      <View style={styles.form}>
        <AuthFormField
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
          label="Your name"
          onChangeText={(value) => updateField("name", value)}
          placeholder="How should we call you?"
          returnKeyType="next"
          textContentType="name"
          value={form.name}
        />

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
          autoComplete="new-password"
          error={errors.password}
          label="Password"
          onChangeText={(value) => updateField("password", value)}
          placeholder="At least 8 characters"
          returnKeyType="next"
          secureTextEntry
          textContentType="newPassword"
          value={form.password}
        />

        <AuthFormField
          autoCapitalize="none"
          autoComplete="new-password"
          error={errors.passwordConfirmation}
          label="Confirm password"
          onChangeText={(value) => updateField("passwordConfirmation", value)}
          placeholder="Enter your password again"
          returnKeyType="done"
          secureTextEntry
          textContentType="newPassword"
          value={form.passwordConfirmation}
        />

        <Text style={styles.terms}>
          By continuing, you agree to the SpeakUp terms and privacy policy.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={handleRegister}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Create account</Text>
              <Text style={styles.arrow}>{"\u2192"}</Text>
            </>
          )}
        </Pressable>
        {submitError && <Text style={styles.submitError}>{submitError}</Text>}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable
          accessibilityRole="link"
          hitSlop={8}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.footerLink}>Sign in</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  form: { gap: 17 },
  terms: { color: "#8FA3C8", fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 3,
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
    marginTop: 28,
  },
  footerText: { color: "#AFC0E0", fontSize: 14 },
  footerLink: { color: "#67E8F9", fontSize: 14, fontWeight: "800" },
});
