"use client";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Mood } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMascotAnimations } from "./useMascotAnimations";

interface MascotBubbleProps {
  mood: Mood;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  gesture?: "idle" | "wave" | "jump" | "shake" | "wiggle" | "bounce";
  variant?: "full" | "compact";
}

const SIZE_MAP = {
  sm: { container: 72, screen: 52, face: 90 },
  md: { container: 100, screen: 74, face: 90 },
  lg: { container: 132, screen: 100, face: 90 },
};

const MOOD_STYLES: Record<
  Mood,
  { screenBg: string; glow: string; led: string; faceColor: string }
> = {
  idle: {
    screenBg: "#0f172a",
    glow: "#38bdf833",
    led: "bg-green-500",
    faceColor: "#38bdf8",
  },
  happy: {
    screenBg: "#0f172a",
    glow: "#10b98133",
    led: "bg-green-400 animate-pulse",
    faceColor: "#10b981",
  },
  affection: {
    screenBg: "#180f1a",
    glow: "#f472b633",
    led: "bg-pink-400 animate-ping",
    faceColor: "#f472b6",
  },
  success: {
    screenBg: "#091a13",
    glow: "#34d39933",
    led: "bg-emerald-400 animate-pulse",
    faceColor: "#34d399",
  },
  thinking: {
    screenBg: "#1e150a",
    glow: "#fbbf2433",
    led: "bg-amber-400",
    faceColor: "#fbbf24",
  },
  confused: {
    screenBg: "#1f1008",
    glow: "#f9731633",
    led: "bg-orange-500",
    faceColor: "#f97316",
  },
  concerned: {
    screenBg: "#111827",
    glow: "#9ca3af33",
    led: "bg-red-400 animate-pulse",
    faceColor: "#f87171",
  },
  sleeping: {
    screenBg: "#0a0f1d",
    glow: "#818cf822",
    led: "bg-indigo-700 opacity-60",
    faceColor: "#818cf8",
  },
};

const GESTURE_VARIANTS = {
  idle: { rotate: 0, y: 0, x: 0 },
  wave: { rotate: [0, -10, 10, -10, 10, 0], transition: { duration: 0.8 } },
  jump: {
    y: [0, -16, 0, -8, 0],
    transition: { duration: 0.5, ease: "easeOut" },
  },
  shake: { x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.4 } },
  wiggle: {
    rotate: [0, -6, 6, -6, 6, 0],
    y: [0, -2, 0],
    transition: { duration: 0.5 },
  },
  bounce: { scale: [1, 1.1, 0.95, 1.05, 1], transition: { duration: 0.4 } },
};

const MOOD_GESTURE: Record<
  Mood,
  "idle" | "wave" | "jump" | "shake" | "wiggle" | "bounce"
> = {
  idle: "idle",
  happy: "bounce",
  affection: "wiggle",
  success: "jump",
  thinking: "idle",
  confused: "shake",
  concerned: "idle",
  sleeping: "idle",
};

export function MascotBubble({
  mood,
  onClick,
  className,
  size = "md",
  gesture,
  variant = "full",
}: MascotBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { eyeX, eyeY } = useMascotAnimations(containerRef);
  const controls = useAnimation();
  const dims = SIZE_MAP[size];
  const style = MOOD_STYLES[mood];
  const isCompact = variant === "compact";
  const isSleeping = mood === "sleeping";
  const [blinkKey, setBlinkKey] = useState(0);

  // Idle hover/float movement
  const floatVariants = {
    float: {
      y: [0, -4, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  };

  useEffect(() => {
    const g = gesture || MOOD_GESTURE[mood];
    if (g !== "idle") {
      controls.start(GESTURE_VARIANTS[g] as any);
    }
  }, [mood, gesture, controls]);

  useEffect(() => {
    const schedBlink = () => {
      const t = 3000 + Math.random() * 2500;
      return setTimeout(() => {
        setBlinkKey((k) => k + 1);
        schedBlink();
      }, t);
    };
    const timer = schedBlink();
    return () => clearTimeout(timer);
  }, []);

  const mouthPath = () => {
    switch (mood) {
      case "happy":
        return `M 32 46 Q 45 58 58 46`;
      case "affection":
        return `M 30 45 Q 45 59 60 45`;
      case "success":
        return `M 30 44 Q 45 58 60 44`;
      case "thinking":
        return `M 38 48 Q 42 46 46 48 Q 50 50 54 48`;
      case "confused":
        return `M 36 50 Q 42 44 48 50 Q 54 56 60 46`;
      case "concerned":
        return `M 36 50 Q 45 45 54 50`;
      case "sleeping":
        return `M 38 48 L 52 48`;
      default:
        return `M 38 46 Q 45 51 52 46`;
    }
  };

  // Eyebrow paths
  const leftBrow = () => {
    switch (mood) {
      case "confused":
        return "M 25 27 Q 31 25 36 28";
      case "concerned":
        return "M 25 29 Q 31 27 36 29";
      case "thinking":
        return "M 26 28 L 33 26";
      case "success":
      case "happy":
        return "M 26 26 Q 31 22 36 25";
      default:
        return null;
    }
  };
  const rightBrow = () => {
    switch (mood) {
      case "confused":
        return "M 54 28 Q 59 25 65 27";
      case "concerned":
        return "M 54 29 Q 59 27 65 29";
      case "thinking":
        return "M 57 26 L 64 28";
      case "success":
      case "happy":
        return "M 54 25 Q 59 22 64 26";
      default:
        return null;
    }
  };

  const lBrow = leftBrow();
  const rBrow = rightBrow();

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative cursor-pointer select-none flex flex-col items-center",
        className,
      )}
      style={{ width: dims.container }}
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="w-full flex flex-col items-center"
        variants={floatVariants}
        animate="float"
      >
        {/* Retro Antenna */}
        {!isCompact && (
          <div className="relative flex justify-center w-full h-4 -mb-1 opacity-80">
            <div className="absolute w-[2px] h-5 bg-zinc-400 dark:bg-zinc-600 origin-bottom rotate-[-20deg]" />
            <div className="absolute w-[2px] h-5 bg-zinc-400 dark:bg-zinc-600 origin-bottom rotate-[20deg]" />
            <div className="absolute top-0 left-[calc(50%-10px)] w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <div className="absolute top-0 right-[calc(50%-10px)] w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
        )}

        {/* Retro TV/Monitor Casing */}
        <div
          className={cn(
            "relative w-full aspect-square bg-zinc-300 dark:bg-zinc-800 border-4 border-zinc-400 dark:border-zinc-700 shadow-2xl flex items-center justify-between",
            isCompact ? "rounded-2xl p-2" : "rounded-2xl p-2.5",
          )}
          style={{
            boxShadow: `0 8px 30px ${style.glow}, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -4px 6px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Inner Curved Monitor Screen */}
          <div
            className="relative flex-1 h-full rounded-lg overflow-hidden border border-zinc-500 dark:border-zinc-900 flex items-center justify-center"
            style={{
              backgroundColor: style.screenBg,
              boxShadow: "inset 0 4px 10px rgba(0,0,0,0.8)",
            }}
          >
            {/* Scanline / Curved Tube CRT effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_3px,3px_100%] opacity-40 z-10" />

            {/* CRT Screen Flicker / Glow Overlay */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/50 pointer-events-none z-10" />

            {/* Bot Face drawing */}
            <svg
              viewBox="0 0 90 90"
              className="absolute w-[95%] h-[95%] z-0"
              style={{ filter: `drop-shadow(0 0 6px ${style.faceColor})` }}
            >
              {/* Eyebrows */}
              {lBrow && (
                <motion.path
                  d={lBrow}
                  fill="none"
                  stroke={style.faceColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {rBrow && (
                <motion.path
                  d={rBrow}
                  fill="none"
                  stroke={style.faceColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* Glowing Pixelated Bot Eyes */}
              {!isSleeping ? (
                <g fill={style.faceColor}>
                  {/* Left eye */}
                  <rect x="22" y="28" width="14" height="14" rx="2" />
                  <AnimatePresence mode="wait">
                    <motion.rect
                      key={`blink-l-${blinkKey}`}
                      x="22"
                      y="28"
                      width="14"
                      height="14"
                      rx="2"
                      fill={style.screenBg}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: [0, 1, 0] }}
                      transition={{ duration: 0.15, times: [0, 0.5, 1] }}
                      style={{ transformOrigin: "center" }}
                    />
                  </AnimatePresence>
                  <circle cx="29" cy="35" r="3" fill="#000" />
                  <circle cx="31" cy="33" r="1" fill="#fff" />

                  {/* Right eye */}
                  <rect x="54" y="28" width="14" height="14" rx="2" />
                  <AnimatePresence mode="wait">
                    <motion.rect
                      key={`blink-r-${blinkKey}`}
                      x="54"
                      y="28"
                      width="14"
                      height="14"
                      rx="2"
                      fill={style.screenBg}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: [0, 1, 0] }}
                      transition={{ duration: 0.15, times: [0, 0.5, 1] }}
                      style={{ transformOrigin: "center" }}
                    />
                  </AnimatePresence>
                  <circle cx="61" cy="35" r="3" fill="#000" />
                  <circle cx="63" cy="33" r="1" fill="#fff" />
                </g>
              ) : (
                /* Sleeping pixel eyes */
                <g
                  stroke={style.faceColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                >
                  <path d="M 22 35 L 36 35" />
                  <path d="M 54 35 L 68 35" />
                </g>
              )}

              {/* Bot Mouth */}
              <motion.path
                key={mood}
                d={mouthPath()}
                fill="none"
                stroke={style.faceColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Sweat drop (confused) */}
              {mood === "confused" && (
                <motion.path
                  d="M 72 20 Q 75 25 72 30 Q 69 25 72 20"
                  fill={style.faceColor}
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Sleeping zzz */}
              {isSleeping && (
                <g fill={style.faceColor} fontWeight="bold">
                  <motion.text
                    x="68"
                    y="24"
                    fontSize="8"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    z
                  </motion.text>
                  <motion.text
                    x="74"
                    y="16"
                    fontSize="6"
                    animate={{ opacity: [0.1, 0.6, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    z
                  </motion.text>
                </g>
              )}
            </svg>
          </div>

          {/* Retro TV Side Panel Controls */}
          {!isCompact && (
            <div className="w-6 h-full ml-2 flex flex-col items-center justify-between py-1 bg-zinc-400 dark:bg-zinc-700/80 rounded-md border border-zinc-500/30">
            {/* TV Knobs */}
            <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 dark:bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center">
              <div className="w-[1px] h-2 bg-zinc-300 rotate-45" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 dark:bg-zinc-900 border border-zinc-500 shadow-sm flex items-center justify-center">
              <div className="w-[1px] h-2 bg-zinc-300 -rotate-12" />
            </div>

            {/* Speaker Grille slats */}
            <div className="flex flex-col gap-0.5 w-3.5">
              <div className="h-[2px] bg-zinc-700/60 dark:bg-zinc-900/60 rounded-full" />
              <div className="h-[2px] bg-zinc-700/60 dark:bg-zinc-900/60 rounded-full" />
              <div className="h-[2px] bg-zinc-700/60 dark:bg-zinc-900/60 rounded-full" />
            </div>

            {/* LED Status indicator */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[6px] text-zinc-600 dark:text-zinc-400 font-mono scale-[0.8] leading-none">
                PWR
              </span>
              <div
                className={cn(
                  "w-2 h-2 rounded-full border border-black/20 shadow-[0_0_4px_currentColor]",
                  style.led,
                )}
              />
            </div>
            </div>
          )}
        </div>

        {/* Retro TV Stand Legs */}
        {!isCompact && (
          <div className="flex justify-between w-[80%] h-2.5 px-3">
            <div className="w-2.5 h-full bg-zinc-400 dark:bg-zinc-600 border-b-2 border-zinc-500 rounded-bl-lg origin-top rotate-[-25deg]" />
            <div className="w-2.5 h-full bg-zinc-400 dark:bg-zinc-600 border-b-2 border-zinc-500 rounded-br-lg origin-top rotate-[25deg]" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

