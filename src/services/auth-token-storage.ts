import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "speakup.access-token";

export function deleteAccessToken(): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.removeItem(TOKEN_KEY);
  }

  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function loadAccessToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveAccessToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    return AsyncStorage.setItem(TOKEN_KEY, token);
  }

  return SecureStore.setItemAsync(TOKEN_KEY, token);
}
