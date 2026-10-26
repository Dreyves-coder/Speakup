export type ConversationCategory =
  | "daily-life"
  | "travel"
  | "work"
  | "developers";

export type ConversationScenario = {
  id: string;
  title: string;
  description: string;
  category: ConversationCategory;
  level: "A1" | "A2" | "B1" | "B2";
  durationMinutes: number;
  status: "available" | "locked";
};
