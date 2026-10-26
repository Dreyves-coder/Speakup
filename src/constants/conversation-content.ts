export type ConversationTurn = {
  explanation: string;
  id: string;
  partnerLine: string;
  responses: readonly string[];
  suggestedResponse: string;
};

export type ConversationContent = {
  id: string;
  partnerRole: string;
  title: string;
  turns: readonly ConversationTurn[];
};

export const CONVERSATION_CONTENT: Readonly<Record<string, ConversationContent>> = {
  "order-a-coffee": {
    id: "order-a-coffee",
    title: "Order a coffee",
    partnerRole: "Barista",
    turns: [
      { id: "coffee-1", partnerLine: "Hi! What can I get for you?", responses: ["I'd like a cappuccino, please.", "I cappuccino now.", "Yesterday coffee."], suggestedResponse: "I'd like a cappuccino, please.", explanation: "'I'd like…' is a polite and natural way to order." },
      { id: "coffee-2", partnerLine: "What size would you like?", responses: ["A small one, please.", "I size good.", "No coffee size."], suggestedResponse: "A small one, please.", explanation: "State the size, then add 'please' to sound polite." },
    ],
  },
  "introduce-yourself": {
    id: "introduce-yourself",
    title: "Meet someone new",
    partnerRole: "New friend",
    turns: [
      { id: "meet-1", partnerLine: "Hi, I'm Jamie. What's your name?", responses: ["Hi Jamie, I'm Alex.", "My name have Alex.", "Alex yesterday."], suggestedResponse: "Hi Jamie, I'm Alex.", explanation: "Use 'I'm' followed by your name." },
      { id: "meet-2", partnerLine: "Nice to meet you. Where are you from?", responses: ["I'm from France.", "I from France.", "At France am."], suggestedResponse: "I'm from France.", explanation: "Use 'I'm from' before your country or city." },
    ],
  },
  "hotel-check-in": {
    id: "hotel-check-in",
    title: "Check in at a hotel",
    partnerRole: "Receptionist",
    turns: [
      { id: "hotel-1", partnerLine: "Good evening. Do you have a reservation?", responses: ["Yes, it's under Morgan.", "Yes, I reservation.", "Under evening."], suggestedResponse: "Yes, it's under Morgan.", explanation: "'It's under…' tells the receptionist the booking name." },
      { id: "hotel-2", partnerLine: "May I see your passport, please?", responses: ["Of course. Here you are.", "Passport is may.", "I see please."], suggestedResponse: "Of course. Here you are.", explanation: "'Here you are' is natural when handing something to someone." },
    ],
  },
  "team-update": {
    id: "team-update",
    title: "Give a team update",
    partnerRole: "Team lead",
    turns: [
      { id: "team-1", partnerLine: "What did you complete yesterday?", responses: ["I finished the login screen.", "I finish tomorrow yesterday.", "Login has me."], suggestedResponse: "I finished the login screen.", explanation: "Use the past simple to describe completed work." },
      { id: "team-2", partnerLine: "Is anything blocking you?", responses: ["I'm waiting for the API credentials.", "I blocking API.", "Credentials waits."], suggestedResponse: "I'm waiting for the API credentials.", explanation: "Use 'I'm waiting for…' to describe a current blocker." },
    ],
  },
  "explain-an-api": {
    id: "explain-an-api",
    title: "Explain an API",
    partnerRole: "Colleague",
    turns: [
      { id: "api-1", partnerLine: "What does this API endpoint do?", responses: ["It returns the current user's profile.", "It profile returns do.", "Endpoint is user maybe."], suggestedResponse: "It returns the current user's profile.", explanation: "Start with 'It returns…' to describe an endpoint's output." },
      { id: "api-2", partnerLine: "Does it require authentication?", responses: ["Yes, it requires a valid access token.", "Yes, authentication require it.", "Token is yesterday."], suggestedResponse: "Yes, it requires a valid access token.", explanation: "Use 'requires' with the singular subject 'it'." },
    ],
  },
};
