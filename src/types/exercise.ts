export type MultipleChoiceExercise = {
  id: string;
  instruction: string;
  prompt: string;
  options: readonly string[];
  correctAnswer: string;
  explanation: string;
};

export type LessonContent = {
  id: string;
  title: string;
  category: string;
  exercises: readonly MultipleChoiceExercise[];
};
