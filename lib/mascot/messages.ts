import type { Mood } from "@/lib/constants";

type MessageCategory =
  | "greeting"
  | "idle"
  | "focus"
  | "deploy"
  | "success"
  | "nudge"
  | "water"
  | "task"
  | "taskAdded"
  | "error"
  | "cheer";

const MESSAGES: Record<MessageCategory, string[]> = {
  greeting: [
    "Hey! Ready to build something great today? 🚀",
    "Good vibes incoming! Let's ship something! ✨",
    "Morning! Your repos are waiting 😎",
    "Let's make today count! 💪",
  ],
  idle: [
    "I'm watching... just kidding 👀",
    "Psst — any todos you're avoiding? 😏",
    "Still here! Ready when you are.",
    "Take your time. I'll just chill here 🌟",
    "Bored? Let's check your deploys!",
  ],
  focus: [
    "Focus mode ON. You've got this! 🎯",
    "Deep work session initiated. Let's go!",
    "No distractions. Just you and the code 💻",
    "I'll hold your notifications. Go build!",
  ],
  deploy: [
    "Deploying... fingers crossed! 🤞",
    "Build in progress... this is the exciting part!",
    "Sending your code to the cloud ☁️",
    "Almost there... deployment in progress!",
  ],
  success: [
    "SHIPPED! That was awesome 🎉",
    "Another one deployed! You're on a roll 🔥",
    "Streak! Keep it going! ⚡",
    "Mission complete. On to the next! 🚀",
  ],
  nudge: [
    "Hey, you've been at it for a while. Take a stretch! 🧘",
    "Reminder: small wins still count! ✅",
    "Don't forget your pending tasks! 📋",
    "10 mins away from the screen = sharper focus 🌿",
  ],
  water: [
    "💧 Hydration check! When did you last drink water?",
    "🥤 Time for some water! Your brain needs it.",
    "Water break! You've been coding for a while.",
    "Stay hydrated! Your best code comes with water 💧",
  ],
  task: [
    "You have pending tasks! Want to knock one out? ✅",
    "Quick win available! Check your todo list 📋",
    "Tasks are waiting... just saying! 😊",
    "Your future self will thank you for this task 🙏",
  ],
  taskAdded: [
    "New task! Let's crush it! 💪",
    "Added to the queue! You got this 🚀",
    "Nice, another task! Let's make it happen ⚡",
    "Task logged! Time to execute 🎯",
  ],
  error: [
    "Oops! That didn't go as planned 😅",
    "Hey, errors are just features in disguise! 🐛",
    "Deep breath. We'll figure this out together 💪",
    "Every bug fixed makes you a better dev!",
  ],
  cheer: [
    "You're doing amazing, seriously! ⭐",
    "Look at you go! Absolute legend 🏆",
    "I believe in you! Keep shipping! 🚀",
    "Incredible work today! Proud of you 💫",
  ],
};

const MOOD_TO_CATEGORIES: Record<Mood, MessageCategory[]> = {
  idle: ["idle"],
  happy: ["cheer", "greeting"],
  affection: ["cheer", "greeting"],
  success: ["success", "cheer"],
  thinking: ["deploy", "focus"],
  confused: ["error"],
  concerned: ["error", "nudge"],
  sleeping: ["idle"],
};

export function getMascotMessage(
  mood: Mood,
  context?: MessageCategory,
): string {
  const categories = context ? [context] : MOOD_TO_CATEGORIES[mood] || ["idle"];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const msgs = MESSAGES[category];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export function getContextualMessage(category: MessageCategory): string {
  const msgs = MESSAGES[category];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export { MESSAGES, type MessageCategory };
