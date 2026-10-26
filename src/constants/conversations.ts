import type {
  ConversationCategory,
  ConversationScenario,
} from "@/types/conversation";

export const CONVERSATION_FILTERS: readonly {
  label: string;
  value: "all" | ConversationCategory;
}[] = [
  { label: "All", value: "all" },
  { label: "Daily life", value: "daily-life" },
  { label: "Travel", value: "travel" },
  { label: "Work", value: "work" },
  { label: "Developers", value: "developers" },
];

export const CONVERSATION_SCENARIOS: readonly ConversationScenario[] = [
  {
    id: "order-a-coffee",
    title: "Order a coffee",
    description: "Practice ordering a drink and answering simple questions.",
    category: "daily-life",
    level: "A1",
    durationMinutes: 4,
    status: "available",
  },
  {
    id: "introduce-yourself",
    title: "Meet someone new",
    description: "Introduce yourself and keep a short conversation going.",
    category: "daily-life",
    level: "A1",
    durationMinutes: 5,
    status: "available",
  },
  {
    id: "hotel-check-in",
    title: "Check in at a hotel",
    description: "Give your details and ask about your room.",
    category: "travel",
    level: "A2",
    durationMinutes: 6,
    status: "available",
  },
  {
    id: "team-update",
    title: "Give a team update",
    description: "Explain what you completed and what comes next.",
    category: "work",
    level: "B1",
    durationMinutes: 7,
    status: "available",
  },
  {
    id: "explain-an-api",
    title: "Explain an API",
    description: "Describe an API clearly to another developer.",
    category: "developers",
    level: "B2",
    durationMinutes: 8,
    status: "available",
  },
];
