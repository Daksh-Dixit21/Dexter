"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  ListTodo,
  MessageCircle,
  Terminal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMascot } from "@/hooks/useMascot";
import { getContextualMessage, getMascotMessage } from "@/lib/mascot/messages";
import type { Mood } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MascotBubble } from "./MascotBubble";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string;
}

interface Subscription {
  id: string;
  name: string;
  renewalDate?: string;
  price?: number;
}

interface NudgeToast {
  id: string;
  message: string;
}

interface BotLog {
  id: string;
  type: "speech" | "nudge";
  mood: Mood;
  message: string;
  createdAt: number;
}

// --- Smart mood derivation -----------------------------------------------
function deriveSmartMood(
  baseMood: Mood,
  activeTodos: Todo[],
  subscriptions: Subscription[],
): Mood {
  const now = Date.now();
  const DAY = 86_400_000;

  // Check overdue todos → urgent (confused)
  const hasOverdue = activeTodos.some((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate).getTime() < now;
  });
  if (hasOverdue) return "confused";

  // Check expiring subscriptions in next 5 days → worried (concerned)
  const hasExpiring = subscriptions.some((s) => {
    if (!s.renewalDate) return false;
    const diff = new Date(s.renewalDate).getTime() - now;
    return diff > 0 && diff < 5 * DAY;
  });
  if (hasExpiring) return "concerned";

  // Many active tasks → anxious (thinking)
  if (activeTodos.length >= 5) return "thinking";

  // Defer to base mood from hook
  return baseMood;
}

// Mood → corner gradient color
const MOOD_GRADIENT: Record<Mood, string> = {
  idle: "rgba(99,102,241,0.12)",
  happy: "rgba(16,185,129,0.12)",
  affection: "rgba(244,114,182,0.12)",
  success: "rgba(52,211,153,0.14)",
  thinking: "rgba(245,158,11,0.14)",
  confused: "rgba(239,68,68,0.14)",
  concerned: "rgba(249,115,22,0.14)",
  sleeping: "rgba(59,130,246,0.10)",
};

// Nudge messages by situation
const NUDGE_MESSAGES: Record<string, string[]> = {
  overdue: [
    "⚠️ You have overdue tasks! Let's tackle them.",
    "🔴 Deadline missed — take action now!",
    "📌 Some todos are past due. Don't let them pile up.",
  ],
  expiring: [
    "💳 A subscription renews soon. Check your billing.",
    "⏰ Renewal incoming — make sure funds are ready.",
    "📋 Heads up: subscription expiring this week.",
  ],
  manyTasks: [
    "📝 Big queue! Pick one task and start.",
    "🧠 Lots on your plate — prioritize and conquer.",
    "⚡ Task overload detected. Focus on #1.",
  ],
  idle: [
    "👋 Hey, what are we building today?",
    "🚀 Ready when you are. Let's ship something.",
    "💡 An idea is just a todo away.",
  ],
};

function getSmartNudge(
  mood: Mood,
  activeTodos: Todo[],
  subs: Subscription[],
): string {
  const now = Date.now();
  const DAY = 86_400_000;

  const hasOverdue = activeTodos.some(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < now,
  );
  const hasExpiring = subs.some((s) => {
    if (!s.renewalDate) return false;
    const diff = new Date(s.renewalDate).getTime() - now;
    return diff > 0 && diff < 5 * DAY;
  });

  let pool: string[];
  if (hasOverdue) pool = NUDGE_MESSAGES.overdue;
  else if (hasExpiring) pool = NUDGE_MESSAGES.expiring;
  else if (activeTodos.length >= 5) pool = NUDGE_MESSAGES.manyTasks;
  else pool = NUDGE_MESSAGES.idle;

  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Component ──────────────────────────────────────────────────────────────
export function MascotCompanion() {
  const { mood: baseMood, triggerTaskComplete, triggerClick } = useMascot();
  const [mascotSize] = useLocalStorage<"sm" | "md" | "lg">("dexter.mascotSize", "md");
  const [todos] = useLocalStorage<Todo[]>("dexter.todos", []);
  const [subscriptions] = useLocalStorage<Subscription[]>("dexter.subscriptions", []);
  const [, setBotLogs] = useLocalStorage<BotLog[]>("dexter.botLogs", []);

  const [isOpen, setIsOpen] = useState(false);
  const [speechMsg, setSpeechMsg] = useState<string | null>(null);
  const [toasts, setToasts] = useState<NudgeToast[]>([]);
  const speechTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSpeechAtRef = useRef(0);
  const lastMoodRef = useRef<Mood | null>(null);

  const activeTodos = todos.filter((t) => !t.completed);
  const mood = deriveSmartMood(baseMood, activeTodos, subscriptions);
  const gradient = MOOD_GRADIENT[mood];

  const appendBotLog = useCallback(
    (type: BotLog["type"], message: string, currentMood: Mood) => {
      setBotLogs((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type,
          mood: currentMood,
          message,
          createdAt: Date.now(),
        },
        ...prev,
      ].slice(0, 40));
    },
    [setBotLogs],
  );

  const showSpeech = useCallback(
    (msg: string, duration = 5000, force = false) => {
      const now = Date.now();
      if (!force && now - lastSpeechAtRef.current < 10 * 60 * 1000) return;
      lastSpeechAtRef.current = now;
      setSpeechMsg(msg);
      appendBotLog("speech", msg, mood);
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setSpeechMsg(null), duration);
    },
    [appendBotLog, mood],
  );

  const addToast = useCallback((message: string) => {
    const id = `${Date.now()}`;
    appendBotLog("nudge", message, mood);
    setToasts((prev) => [...prev.slice(-1), { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }, [appendBotLog, mood]);

  // Mark task complete with happy animation
  const handleTaskComplete = useCallback(() => {
    triggerTaskComplete();
    showSpeech("✅ " + getContextualMessage("success"), 4000, true);
  }, [triggerTaskComplete, showSpeech]);

  // Welcome greeting, once per page session.
  useEffect(() => {
    const timer = setTimeout(() => {
      showSpeech(getContextualMessage("greeting"), 6000, true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for task completion events from TodoSystem
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.action === "taskCompleted") {
        handleTaskComplete();
      }
      if (detail?.action === "taskAdded") {
        showSpeech(getContextualMessage("taskAdded"), 4000, true);
      }
    };
    window.addEventListener("dexter:mascot", handler);
    return () => window.removeEventListener("dexter:mascot", handler);
  }, [handleTaskComplete, showSpeech]);

  // React to meaningful mood changes with a cooldown.
  useEffect(() => {
    if (mood === "idle" || mood === "sleeping" || lastMoodRef.current === mood) {
      lastMoodRef.current = mood;
      return;
    }
    lastMoodRef.current = mood;
    showSpeech(getMascotMessage(mood), 5000);
  }, [mood, showSpeech]);

  // Periodic nudges, intentionally slow so the bot feels present, not noisy.
  useEffect(() => {
    const interval = setInterval(
      () => {
        const nudge = getSmartNudge(mood, activeTodos, subscriptions);
        addToast(nudge);
      },
      30 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [mood, activeTodos.length, subscriptions.length, addToast]);

  return (
    <>
      {/* Mood corner gradient — bottom-right */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-30 w-80 h-80 rounded-full blur-3xl transition-all duration-700"
        style={{ background: `radial-gradient(circle at bottom right, ${gradient} 0%, transparent 70%)` }}
      />

      {/* Toast nudges */}
      <div className="fixed bottom-28 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              className="flex items-start gap-2.5 p-3.5 rounded-xl border border-border bg-surface shadow-2xl max-w-[240px] pointer-events-auto font-mono text-[11px] leading-relaxed text-text"
            >
              <MessageCircle className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
              <p className="flex-1">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-text-dim hover:text-text shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Companion float area */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6">
        {/* Speech bubble */}
        <AnimatePresence>
          {speechMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              className="relative bg-zinc-950 border border-zinc-800 text-green-400 font-mono text-xs rounded-xl shadow-xl px-4 py-3 max-w-[220px] select-none"
            >
              <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-1 mb-1.5 opacity-60">
                <Terminal className="h-3 w-3" />
                <span>DEXTER</span>
              </div>
              <p className="leading-relaxed">{speechMsg}</p>
              <div
                className="absolute -bottom-2 right-6 w-3 h-3 bg-zinc-950 border-r border-b border-zinc-800 rotate-45"
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task panel (shown on click) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-zinc-950 border-2 border-zinc-800 rounded-xl shadow-2xl p-4 w-72 space-y-3 border-b-4 border-r-4 text-green-400 font-mono text-xs select-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 animate-pulse" />
                  <span className="font-bold tracking-widest text-[10px]">
                    DEXTER.OS — {mood.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-600 hover:text-green-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status bar */}
              <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <ListTodo className="h-3 w-3" />
                  {activeTodos.length} pending
                </span>
                {activeTodos.some(
                  (t) => t.dueDate && new Date(t.dueDate).getTime() < Date.now(),
                ) && (
                  <span className="flex items-center gap-1 text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    Overdue!
                  </span>
                )}
                {subscriptions.some((s) => {
                  if (!s.renewalDate) return false;
                  const diff = new Date(s.renewalDate).getTime() - Date.now();
                  return diff > 0 && diff < 5 * 86_400_000;
                }) && (
                  <span className="flex items-center gap-1 text-orange-400">
                    <Clock className="h-3 w-3" />
                    Sub expiring
                  </span>
                )}
              </div>

              {/* Active tasks */}
              <div className="max-h-44 overflow-y-auto space-y-1 border border-zinc-900 rounded p-2 bg-zinc-950/80">
                {activeTodos.length === 0 ? (
                  <div className="text-center py-4 text-zinc-600 italic">
                    Queue empty. Good work. ✅
                  </div>
                ) : (
                  activeTodos.map((todo) => {
                    const isOverdue =
                      todo.dueDate &&
                      new Date(todo.dueDate).getTime() < Date.now();
                    return (
                      <div
                        key={todo.id}
                        className="flex items-center gap-2 py-1 border-b border-zinc-900/50 last:border-0 group"
                      >
                        <button
                          onClick={() => handleTaskComplete(todo.id)}
                          className="text-zinc-700 hover:text-green-400 transition-colors shrink-0"
                          title="Mark done"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>
                        <p className={cn("truncate flex-1", isOverdue ? "text-red-400" : "text-zinc-300")}>
                          {todo.text}
                        </p>
                        {todo.dueDate && (
                          <span className={cn("text-[9px] whitespace-nowrap shrink-0", isOverdue ? "text-red-500" : "text-zinc-600")}>
                            {todo.dueDate}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The TV Monitor */}
        <motion.div whileHover={{ scale: 1.03 }} className="relative">
          <MascotBubble
            mood={mood}
            size={mascotSize}
            variant="compact"
            onClick={() => {
              setIsOpen((v) => !v);
              triggerClick();
              if (!isOpen) showSpeech(getMascotMessage(mood), 4000, true);
            }}
          />
          {/* Pending count badge */}
          {activeTodos.length > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-background text-white text-[9px] font-bold flex items-center justify-center shadow-md"
            >
              {activeTodos.length > 9 ? "9+" : activeTodos.length}
            </motion.span>
          )}
        </motion.div>
      </div>
    </>
  );
}
