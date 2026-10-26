import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  LessonCompletionInput,
  StoredLessonCompletion,
} from "@/types/learning-progress";

function storageKey(userId: string) {
  return `@speakup/lesson-completions/${userId}/v1`;
}

export async function loadLessonCompletions(
  userId: string,
): Promise<Record<string, StoredLessonCompletion>> {
  const value = await AsyncStorage.getItem(storageKey(userId));

  if (!value) return {};

  try {
    return JSON.parse(value) as Record<string, StoredLessonCompletion>;
  } catch {
    return {};
  }
}

export async function saveLessonCompletionLocally(
  userId: string,
  completion: LessonCompletionInput,
): Promise<void> {
  const completions = await loadLessonCompletions(userId);
  completions[completion.lessonId] = {
    ...completion,
    completedAt: new Date().toISOString(),
    pendingSync: true,
  };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(completions));
}

export async function markLessonCompletionSynced(
  userId: string,
  lessonId: string,
): Promise<void> {
  const completions = await loadLessonCompletions(userId);
  const completion = completions[lessonId];

  if (!completion) return;

  completions[lessonId] = { ...completion, pendingSync: false };
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(completions));
}
