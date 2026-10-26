import AsyncStorage from "@react-native-async-storage/async-storage";

export type SpeakingResult = {
  completedAt: string;
  correctAnswers: number;
  scenarioId: string;
  totalTurns: number;
};

function storageKey(userId: string) {
  return `@speakup/speaking-results/${userId}/v1`;
}

export async function loadSpeakingResults(userId: string): Promise<SpeakingResult[]> {
  const value = await AsyncStorage.getItem(storageKey(userId));
  if (!value) return [];

  try {
    return JSON.parse(value) as SpeakingResult[];
  } catch {
    return [];
  }
}

export async function saveSpeakingResult(
  userId: string,
  result: Omit<SpeakingResult, "completedAt">,
): Promise<void> {
  const results = await loadSpeakingResults(userId);
  await AsyncStorage.setItem(
    storageKey(userId),
    JSON.stringify([
      { ...result, completedAt: new Date().toISOString() },
      ...results,
    ].slice(0, 50)),
  );
}
