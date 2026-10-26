export type LessonCompletionInput = {
  correctAnswers: number;
  durationMinutes: number;
  lessonId: string;
  totalQuestions: number;
};

export type StoredLessonCompletion = LessonCompletionInput & {
  completedAt: string;
  pendingSync: boolean;
};

export type ProgressSnapshot = {
  activity: {
    date: string;
    label: string;
    minutes: number;
  }[];
  accuracy: number;
  learningMinutes: number;
  levelProgress: number;
  lessonsCompleted: number;
  recentActivity: {
    completedAt: string;
    correctAnswers: number;
    lessonId: string;
    lessonTitle: string;
    totalQuestions: number;
  }[];
  skills: {
    accuracy: number;
    category: "grammar" | "listening" | "vocabulary";
    completed: number;
    progress: number;
    total: number;
  }[];
  streakDays: number;
  totalXp: number;
};
