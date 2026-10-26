import type { Lesson, LessonCategory } from "@/types/lesson";

export const LEARN_FILTERS: readonly {
  label: string;
  value: "all" | LessonCategory;
}[] = [
  { label: "All", value: "all" },
  { label: "Vocabulary", value: "vocabulary" },
  { label: "Grammar", value: "grammar" },
  { label: "Listening", value: "listening" },
];

export const LESSONS: readonly Lesson[] = [
  {
    id: "introduce-yourself",
    title: "Introduce yourself",
    description: "Simple phrases for meeting someone new.",
    category: "vocabulary",
    durationMinutes: 8,
    exerciseCount: 4,
    progress: 0,
    status: "available",
  },
  {
    id: "everyday-questions",
    title: "Everyday questions",
    description: "Ask and answer common daily questions.",
    category: "grammar",
    durationMinutes: 12,
    exerciseCount: 4,
    progress: 0,
    status: "available",
  },
  {
    id: "at-the-coffee-shop",
    title: "At the coffee shop",
    description: "Understand a short, realistic conversation.",
    category: "listening",
    durationMinutes: 10,
    exerciseCount: 4,
    progress: 0,
    status: "available",
  },
  {
    id: "talk-about-routines",
    title: "Talk about routines",
    description: "Use the present simple with confidence.",
    category: "grammar",
    durationMinutes: 14,
    exerciseCount: 5,
    progress: 0,
    status: "locked",
  },
  {
    id: "places-in-the-city",
    title: "Places in the city",
    description: "Build vocabulary for everyday directions.",
    category: "vocabulary",
    durationMinutes: 9,
    exerciseCount: 4,
    progress: 0,
    status: "locked",
  },
];
