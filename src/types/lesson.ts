export type LessonCategory = "vocabulary" | "grammar" | "listening";

export type LessonStatus = "available" | "completed" | "locked";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  durationMinutes: number;
  exerciseCount: number;
  progress: number;
  status: LessonStatus;
};
