import { MOOD_COLORS, type Mood } from "@/lib/constants";

export const MOOD_MAPPINGS = {
  idle: {
    colors: MOOD_COLORS.idle,
    mouth: "neutral",
    description: "Dexter is chilling",
  },
  happy: {
    colors: MOOD_COLORS.happy,
    mouth: "smile",
    description: "Dexter is happy",
  },
  affection: {
    colors: MOOD_COLORS.affection,
    mouth: "wide-smile",
    description: "Dexter loves you",
  },
  success: {
    colors: MOOD_COLORS.success,
    mouth: "grin",
    description: "Great job!",
  },
  thinking: {
    colors: MOOD_COLORS.thinking,
    mouth: "wavy",
    description: "Dexter is thinking...",
  },
  confused: {
    colors: MOOD_COLORS.confused,
    mouth: "wavy-wide",
    description: "Dexter is confused",
  },
  concerned: {
    colors: MOOD_COLORS.concerned,
    mouth: "frown",
    description: "Dexter is worried",
  },
  sleeping: {
    colors: MOOD_COLORS.sleeping,
    mouth: "closed",
    description: "Dexter is sleeping",
  },
} as const;

export function getMoodColors(mood: Mood) {
  return MOOD_MAPPINGS[mood]?.colors ?? MOOD_COLORS.idle;
}

export function getMouthPath(mood: Mood): string {
  const mouths: Record<Mood, string> = {
    idle: "M 28 38 Q 32 40 36 38",
    happy: "M 26 36 Q 32 44 38 36",
    affection: "M 24 35 Q 32 46 40 35",
    success: "M 24 34 Q 32 48 40 34",
    thinking: "M 28 38 Q 30 36 32 38 Q 34 40 36 38",
    confused: "M 28 37 Q 30 35 32 38 Q 34 41 36 37",
    concerned: "M 28 40 Q 32 36 36 40",
    sleeping: "M 28 38 L 36 38",
  };
  return mouths[mood] ?? mouths.idle;
}
