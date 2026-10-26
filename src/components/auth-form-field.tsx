import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type AuthFormFieldProps = Pick<
  TextInputProps,
  | "autoCapitalize"
  | "autoComplete"
  | "keyboardType"
  | "onChangeText"
  | "placeholder"
  | "returnKeyType"
  | "textContentType"
  | "value"
> & {
  error?: string;
  label: string;
  secureTextEntry?: boolean;
};

export function AuthFormField({
  error,
  label,
  secureTextEntry = false,
  ...inputProps
}: AuthFormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          isFocused && styles.inputShellFocused,
          error && styles.inputShellError,
        ]}
      >
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          placeholderTextColor="#7082A6"
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          selectionColor="#67E8F9"
          style={styles.input}
        />

        {secureTextEntry && (
          <Pressable
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
          >
            <Text style={styles.visibilityButton}>
              {isPasswordVisible ? "HIDE" : "SHOW"}
            </Text>
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { color: "#DCE7FF", fontSize: 13, fontWeight: "700" },
  inputShell: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
  },
  inputShellFocused: {
    borderColor: "#67E8F9",
    backgroundColor: "rgba(59, 130, 246, 0.13)",
  },
  inputShellError: { borderColor: "#FB7185" },
  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 0,
    color: "#FFFFFF",
    fontSize: 16,
  },
  visibilityButton: {
    paddingLeft: 12,
    color: "#8CDDE7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  error: { color: "#FDA4AF", fontSize: 12, lineHeight: 17 },
});
