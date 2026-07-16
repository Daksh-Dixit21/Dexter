import { Mood } from "@/lib/constants";

type MascotState = {
  mood: Mood;
  lastInteraction: number;
  streak: number;
  deployStatus: "idle" | "running" | "success" | "failed";
  codingStartTime: number | null;
};

type MascotAction =
  | { type: "CLICK" }
  | { type: "PET" }
  | { type: "TASK_COMPLETE" }
  | { type: "DEPLOY_START" }
  | { type: "DEPLOY_SUCCESS" }
  | { type: "DEPLOY_FAILED" }
  | { type: "INACTIVE_5MIN" }
  | { type: "INTERACTION" }
  | { type: "KEYSTROKE" }
  | { type: "IDLE_30SEC" }
  | { type: "STREAK_5" }
  | { type: "ERROR" }
  | { type: "SLOW_NETWORK" }
  | { type: "NETWORK_OK" };

const MOOD_PRIORITIES: Record<Mood, number> = {
  success: 10,
  concerned: 9,
  affection: 8,
  thinking: 7,
  happy: 4,
  confused: 3,
  sleeping: 2,
  idle: 1,
};

export function mascotReducer(state: MascotState, action: MascotAction): MascotState {
  const now = Date.now();

  switch (action.type) {
    case "CLICK":
    case "TASK_COMPLETE":
      return { ...state, mood: "happy", lastInteraction: now };

    case "PET":
      return { ...state, mood: "affection", lastInteraction: now };

    case "DEPLOY_START":
      return { ...state, mood: "thinking", deployStatus: "running", lastInteraction: now };

    case "DEPLOY_SUCCESS":
      return {
        ...state,
        mood: "success",
        deployStatus: "success",
        lastInteraction: now,
        streak: state.streak + 1,
      };

    case "DEPLOY_FAILED":
      return { ...state, mood: "concerned", deployStatus: "failed", lastInteraction: now };

    case "INACTIVE_5MIN":
      return { ...state, mood: "sleeping", lastInteraction: now };

    case "INTERACTION":
      if (state.mood === "sleeping") {
        return { ...state, mood: "idle", lastInteraction: now };
      }
      return { ...state, lastInteraction: now };

    case "KEYSTROKE":
      return { ...state, mood: "idle", lastInteraction: now };

    case "IDLE_30SEC":
      return state;

    case "STREAK_5":
      return { ...state, mood: "affection", lastInteraction: now };

    case "ERROR":
      return { ...state, mood: "confused", lastInteraction: now };

    case "SLOW_NETWORK":
      return { ...state, mood: "thinking", lastInteraction: now };

    case "NETWORK_OK":
      if (state.mood === "thinking") {
        return { ...state, mood: "idle" };
      }
      return state;

    default:
      return state;
  }
}

export const initialMascotState: MascotState = {
  mood: "idle",
  lastInteraction: Date.now(),
  streak: 0,
  deployStatus: "idle",
  codingStartTime: null,
};
