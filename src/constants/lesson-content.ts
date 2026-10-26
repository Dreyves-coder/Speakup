import type { LessonContent } from "@/types/exercise";

export const LESSON_CONTENT: Readonly<Record<string, LessonContent>> = {
  "introduce-yourself": {
    id: "introduce-yourself",
    title: "Introduce yourself",
    category: "Vocabulary",
    exercises: [
      { id: "intro-1", instruction: "Choose the natural introduction", prompt: "Hi, ___ name is Alex.", options: ["my", "me", "I"], correctAnswer: "my", explanation: "Use 'my' before a noun: my name." },
      { id: "intro-2", instruction: "Complete the sentence", prompt: "I ___ from France.", options: ["am", "is", "are"], correctAnswer: "am", explanation: "The verb 'to be' with I is 'am'." },
      { id: "intro-3", instruction: "Choose the best reply", prompt: "Nice to meet you!", options: ["Nice to meet you too!", "I am twenty.", "See yesterday."], correctAnswer: "Nice to meet you too!", explanation: "Reply with the same friendly expression and add 'too'." },
      { id: "intro-4", instruction: "Complete the introduction", prompt: "I work ___ a web developer.", options: ["as", "at", "from"], correctAnswer: "as", explanation: "Use 'work as' before a job or role." },
    ],
  },
  "everyday-questions": {
    id: "everyday-questions",
    title: "Everyday questions",
    category: "Grammar",
    exercises: [
      { id: "question-1", instruction: "Choose the correct word", prompt: "___ you like coffee?", options: ["Do", "Does", "Are"], correctAnswer: "Do", explanation: "Use 'do' with I, you, we and they in present simple questions." },
      { id: "question-2", instruction: "Complete the question", prompt: "Where ___ she work?", options: ["do", "does", "is"], correctAnswer: "does", explanation: "Use 'does' with he, she and it in present simple questions." },
      { id: "question-3", instruction: "Choose the natural question", prompt: "___ they ready?", options: ["Do", "Are", "Does"], correctAnswer: "Are", explanation: "Use 'are' with they when the main verb is 'to be'." },
      { id: "question-4", instruction: "Choose the correct question word", prompt: "___ do you live?", options: ["Where", "Who", "When"], correctAnswer: "Where", explanation: "Use 'where' to ask about a place." },
    ],
  },
  "at-the-coffee-shop": {
    id: "at-the-coffee-shop",
    title: "At the coffee shop",
    category: "Listening",
    exercises: [
      { id: "coffee-1", instruction: "Choose what the customer says", prompt: "I'd like ___ coffee, please.", options: ["a", "an", "some one"], correctAnswer: "a", explanation: "Use 'a' before the singular countable noun 'coffee'." },
      { id: "coffee-2", instruction: "Choose the natural server question", prompt: "___ or large?", options: ["Small", "Little", "Short"], correctAnswer: "Small", explanation: "Drink sizes are commonly described as small or large." },
      { id: "coffee-3", instruction: "Complete the order", prompt: "Can I ___ a cappuccino?", options: ["have", "take to", "make me"], correctAnswer: "have", explanation: "'Can I have…?' is a polite, natural way to order." },
      { id: "coffee-4", instruction: "Choose the correct reply", prompt: "Anything else?", options: ["No, that's all.", "It is else.", "Nothing coffee."], correctAnswer: "No, that's all.", explanation: "'That's all' politely says your order is complete." },
    ],
  },
  "talk-about-routines": {
    id: "talk-about-routines",
    title: "Talk about routines",
    category: "Grammar",
    exercises: [
      { id: "routine-1", instruction: "Complete the routine", prompt: "I ___ up at seven every day.", options: ["get", "gets", "getting"], correctAnswer: "get", explanation: "Use the base verb with I in the present simple." },
      { id: "routine-2", instruction: "Choose the correct verb", prompt: "She ___ work at nine.", options: ["starts", "start", "starting"], correctAnswer: "starts", explanation: "Add -s to the present simple verb with she." },
      { id: "routine-3", instruction: "Choose the frequency word", prompt: "I ___ check my email in the morning.", options: ["usually", "yesterday", "soon"], correctAnswer: "usually", explanation: "'Usually' describes how often a routine happens." },
      { id: "routine-4", instruction: "Complete the negative sentence", prompt: "He ___ work on Sundays.", options: ["doesn't", "don't", "isn't"], correctAnswer: "doesn't", explanation: "Use 'doesn't' with he, she and it." },
      { id: "routine-5", instruction: "Choose the correct time phrase", prompt: "We exercise ___ the evening.", options: ["in", "on", "at"], correctAnswer: "in", explanation: "Say 'in the morning', 'in the afternoon' and 'in the evening'." },
    ],
  },
  "places-in-the-city": {
    id: "places-in-the-city",
    title: "Places in the city",
    category: "Vocabulary",
    exercises: [
      { id: "city-1", instruction: "Choose the correct place", prompt: "You can borrow books at the ___.", options: ["library", "bakery", "station"], correctAnswer: "library", explanation: "A library lends books and provides reading spaces." },
      { id: "city-2", instruction: "Choose the correct place", prompt: "You catch a train at the ___.", options: ["station", "pharmacy", "museum"], correctAnswer: "station", explanation: "Trains arrive at and depart from a station." },
      { id: "city-3", instruction: "Complete the direction", prompt: "The bank is ___ the supermarket.", options: ["next to", "under morning", "with left"], correctAnswer: "next to", explanation: "'Next to' means directly beside another place." },
      { id: "city-4", instruction: "Choose the useful direction", prompt: "How do I get to the museum?", options: ["Turn left at the corner.", "It likes art.", "I get yesterday."], correctAnswer: "Turn left at the corner.", explanation: "'Turn left at the corner' gives a clear direction." },
    ],
  },
};

export const STATIC_LESSON_IDS = Object.keys(LESSON_CONTENT).map((id) => ({ id }));
