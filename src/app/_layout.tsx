import { AuthProvider } from "@/contexts/auth-context";
import { UserPreferencesProvider } from "@/contexts/user-preferences-context";
import { useAuth } from "@/hooks/use-auth";
import { configureNotificationHandling } from "@/services/daily-reminder";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

configureNotificationHandling();

function RootNavigator() {
  const { isReady, session } = useAuth();

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#07142F" }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="get-started" />
        <Stack.Screen name="level" />
        <Stack.Screen name="placement-test" />
        <Stack.Screen name="ready" />
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="support" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </UserPreferencesProvider>
    </AuthProvider>
  );
}
