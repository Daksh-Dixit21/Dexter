"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useMascotAnimations } from "./useMascotAnimations";
import type { Mood } from "@/lib/constants";

interface MascotBubbleProps {
  mood: Mood;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { container: 40, eye: 4, pupil: 2 },
  md: { container: 56, eye: 5.5, pupil: 2.5 },
  lg: { container: 72, eye: 7, pupil: 3.5 },
};

const MOOD_STYLES: Record<Mood, { bg: string; accent: string }> = {
  idle: { bg: "#6366f1", accent: "#a5b4fc" },
  happy: { bg: "#3b82f6", accent: "#93c5fd" },
  affection: { bg: "#ec4899", accent: "#f9a8d4" },
  success: { bg: "#10b981", accent: "#6ee7b7" },
  thinking: { bg: "#f59e0b", accent: "#fcd34d" },
  confused: { bg: "#f97316", accent: "#fdba74" },
  concerned: { bg: "#6b7280", accent: "#d1d5db" },
  sleeping: { bg: "#3b82f6", accent: "#93c5fd" },
};

export function MascotBubble({ mood, onClick, className, size = "md" }: MascotBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { eyeX, eyeY } = useMascotAnimations(containerRef);
  const dims = SIZE_MAP[size];
  const style = MOOD_STYLES[mood];
  const isSleeping = mood === "sleeping";

  const mouthPath = () => {
    switch (mood) {
      case "happy": return "M 38 44 Q 45 52 52 44";
      case "affection": return "M 36 43 Q 45 54 54 43";
      case "success": return "M 36 42 Q 45 54 54 42";
      case "thinking": return "M 40 45 Q 43 43 46 45 Q 49 47 52 45";
      case "confused": return "M 38 46 Q 42 42 46 46 Q 50 50 54 44";
      case "concerned": return "M 38 47 Q 45 42 52 47";
      case "sleeping": return "M 38 45 L 52 45";
      default: return "M 38 44 Q 45 47 52 44";
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative cursor-pointer select-none rounded-full", className)}
      style={{ width: dims.container, height: dims.container }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{ background: style.bg, opacity: 0.2 }}
      />

      {/* Body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${style.bg}ee, ${style.bg})`,
          boxShadow: `0 2px 12px ${style.bg}44`,
        }}
      />

      {/* SVG Face */}
      <svg viewBox="0 0 90 90" className="absolute inset-0 w-full h-full">
        {/* Eyes */}
        {!isSleeping ? (
          <g>
            {/* Left eye */}
            <ellipse cx="34" cy="36" rx={dims.eye} ry={dims.eye} fill="white" />
            <motion.circle cx="34" cy="36" r={dims.pupil} fill="#1a1a2e" style={{ x: eyeX, y: eyeY }} />
            <motion.circle cx="35" cy="35" r={dims.pupil * 0.4} fill="rgba(255,255,255,0.8)" style={{ x: eyeX, y: eyeY }} />
            {/* Right eye */}
            <ellipse cx="56" cy="36" rx={dims.eye} ry={dims.eye} fill="white" />
            <motion.circle cx="56" cy="36" r={dims.pupil} fill="#1a1a2e" style={{ x: eyeX, y: eyeY }} />
            <motion.circle cx="57" cy="35" r={dims.pupil * 0.4} fill="rgba(255,255,255,0.8)" style={{ x: eyeX, y: eyeY }} />
          </g>
        ) : (
          <g>
            <path d="M 30 36 Q 34 34 38 36" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 52 36 Q 56 34 60 36" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        )}

        {/* Cheeks for affection */}
        {mood === "affection" && (
          <g>
            <circle cx="26" cy="42" r="3.5" fill="rgba(255,150,180,0.35)" />
            <circle cx="64" cy="42" r="3.5" fill="rgba(255,150,180,0.35)" />
          </g>
        )}

        {/* Mouth */}
        <path d={mouthPath()} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Sleep zzz */}
        {isSleeping && (
          <g>
            <text x="62" y="26" fontSize="7" fill="rgba(255,255,255,0.35)" fontWeight="bold">z</text>
            <text x="67" y="20" fontSize="5" fill="rgba(255,255,255,0.25)" fontWeight="bold">z</text>
          </g>
        )}

        {/* Thinking dot */}
        {mood === "thinking" && (
          <circle cx="64" cy="28" r="2" fill="rgba(255,255,255,0.3)" />
        )}
      </svg>
    </motion.div>
  );
}
