import { LESSONS } from "@/constants/lessons";
import { apiRequest } from "@/services/api-client";
import {
  loadLessonCompletions,
  markLessonCompletionSynced,
  saveLessonCompletionLocally,
} from "@/services/learning-storage";
import type { Lesson } from "@/types/lesson";
import type {
  LessonCompletionInput,
  ProgressSnapshot,
} from "@/types/learning-progress";

type ApiLesson = Omit<Lesson, "category"> & {
  category: "VOCABULARY" | "GRAMMAR" | "LISTENING";
};

function normalizeLesson(lesson: ApiLesson): Lesson {
  return {
    ...lesson,
    category: lesson.category.toLowerCase() as Lesson["category"],
  };
}

export async function getLessons(
  token: string,
  userId: string,
): Promise<Lesson[]> {
  const localCompletions = await loadLessonCompletions(userId);

  try {
    await syncPendingLessonCompletions(token, userId);
    const remoteLessons = await apiRequest<ApiLesson[]>("/lessons", { token });
    return remoteLessons.map(normalizeLesson);
  } catch {
    return LESSONS.map((lesson) =>
      localCompletions[lesson.id]
        ? { ...lesson, progress: 1, status: "completed" }
        : lesson,
    );
  }
}

export async function recordLessonCompletion(
  token: string,
  userId: string,
  completion: LessonCompletionInput,
): Promise<"synced" | "offline"> {
  await saveLessonCompletionLocally(userId, completion);

  try {
    await sendLessonCompletion(token, completion);
    await markLessonCompletionSynced(userId, completion.lessonId);
    return "synced";
  } catch {
    return "offline";
  }
}

export async function getProgress(
  token: string,
  userId: string,
): Promise<ProgressSnapshot> {
  try {
    await syncPendingLessonCompletions(token, userId);
    return await apiRequest<ProgressSnapshot>("/progress", { token });
  } catch {
    const stored = Object.values(await loadLessonCompletions(userId));
    const questions = stored.reduce((sum, item) => sum + item.totalQuestions, 0);
    const correct = stored.reduce((sum, item) => sum + item.correctAnswers, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      return {
        date: date.toISOString(),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        minutes: stored
          .filter((item) => {
            const completedAt = new Date(item.completedAt);
            return completedAt >= date && completedAt < nextDate;
          })
          .reduce((sum, item) => sum + item.durationMinutes, 0),
      };
    });
    const completedDays = new Set(
      stored.map((item) => {
        const date = new Date(item.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    );
    let streakDays = 0;
    const cursor = new Date(today);
    while (completedDays.has(cursor.getTime())) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const skills = (["vocabulary", "grammar", "listening"] as const).map(
      (category) => {
        const categoryLessons = LESSONS.filter(
          (lesson) => lesson.category === category,
        );
        const categoryResults = stored.filter(
          (item) =>
            LESSONS.find((lesson) => lesson.id === item.lessonId)?.category ===
            category,
        );
        const categoryQuestions = categoryResults.reduce(
          (sum, item) => sum + item.totalQuestions,
          0,
        );
        const categoryCorrect = categoryResults.reduce(
          (sum, item) => sum + item.correctAnswers,
          0,
        );

        return {
          accuracy:
            categoryQuestions === 0
              ? 0
              : Math.round((categoryCorrect / categoryQuestions) * 100),
          category,
          completed: categoryResults.length,
          progress:
            categoryLessons.length === 0
              ? 0
              : categoryResults.length / categoryLessons.length,
          total: categoryLessons.length,
        };
      },
    );

    return {
      activity,
      accuracy: questions === 0 ? 0 : Math.round((correct / questions) * 100),
      learningMinutes: stored.reduce(
        (sum, item) => sum + item.durationMinutes,
        0,
      ),
      levelProgress: stored.length / LESSONS.length,
      lessonsCompleted: stored.length,
      recentActivity: stored
        .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
        .slice(0, 5)
        .map((item) => ({
          completedAt: item.completedAt,
          correctAnswers: item.correctAnswers,
          lessonId: item.lessonId,
          lessonTitle:
            LESSONS.find((lesson) => lesson.id === item.lessonId)?.title ??
            "English lesson",
          totalQuestions: item.totalQuestions,
        })),
      skills,
      streakDays,
      totalXp: stored.reduce(
        (sum, item) => sum + item.correctAnswers * 10 + 25,
        0,
      ),
    };
  }
}

async function sendLessonCompletion(
  token: string,
  completion: LessonCompletionInput,
) {
  const { lessonId, ...body } = completion;
  return apiRequest(`/lessons/${lessonId}/complete`, {
    body,
    method: "POST",
    token,
  });
}

async function syncPendingLessonCompletions(token: string, userId: string) {
  const completions = await loadLessonCompletions(userId);

  for (const completion of Object.values(completions)) {
    if (!completion.pendingSync) continue;

    await sendLessonCompletion(token, completion);
    await markLessonCompletionSynced(userId, completion.lessonId);
  }
}
