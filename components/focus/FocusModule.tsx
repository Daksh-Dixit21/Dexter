"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Coffee,
  Flame,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Trash2,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type SessionType = "work" | "break" | "longBreak" | "deepWork";

interface Session {
  date: string;
  duration: number;
  type: SessionType;
}

interface TimerConfig {
  work: number;
  break: number;
  longBreak: number;
  deepWork: number;
}

const TIMER_CONFIG: TimerConfig = {
  work: 25 * 60,
  break: 5 * 60,
  longBreak: 15 * 60,
  deepWork: 0,
};

const MOTIVATIONAL_TEXTS: Record<SessionType, string[]> = {
  work: [
    "Stay focused, you're doing great!",
    "Deep work mode activated — block out distractions.",
    "One pomodoro at a time.",
    "Your future self will thank you.",
    "Consistency beats intensity.",
  ],
  break: [
    "Stretch your legs, hydrate!",
    "Rest is part of the process.",
    "Breathe. Recharge. Repeat.",
    "You've earned this break.",
  ],
  longBreak: [
    "Great session! Take a longer breather.",
    "Walk around, grab a coffee.",
    "Your brain needs this reset.",
  ],
  deepWork: [
    "Deep work — no timer, just flow.",
    "Ride the momentum.",
    "This is where magic happens.",
  ],
};

function getMotivation(type: SessionType): string {
  const texts = MOTIVATIONAL_TEXTS[type];
  return texts[Math.floor(Math.random() * texts.length)];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function FocusModule() {
  const [sessions, setSessions] = useLocalStorage<Session[]>(
    "dexter.focusSessions",
    [],
  );
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [secondsLeft, setSecondsLeft] = useState(TIMER_CONFIG.work);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosToday, setPomodorosToday] = useState(0);
  const [isDeepWork, setIsDeepWork] = useState(false);
  const [deepWorkStart, setDeepWorkStart] = useState<number | null>(null);
  const [deepWorkElapsed, setDeepWorkElapsed] = useState(0);
  const [motivation, setMotivation] = useState(getMotivation("work"));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const today = formatDateKey(new Date());
    const count = sessions.filter(
      (s) => s.date === today && s.type === "work",
    ).length;
    setPomodorosToday(count);
  }, [sessions]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (isDeepWork) {
        setDeepWorkElapsed((prev) => prev + 1);
        return;
      }

      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isDeepWork]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    const newSession: Session = {
      date: formatDateKey(new Date()),
      duration: TIMER_CONFIG[sessionType === "deepWork" ? "work" : sessionType],
      type: sessionType,
    };
    setSessions((prev) => [...prev, newSession]);
    setMotivation(getMotivation(sessionType));

    if (sessionType === "work") {
      const today = formatDateKey(new Date());
      const workSessionsToday =
        sessions.filter((s) => s.date === today && s.type === "work").length +
        1;

      if (workSessionsToday % 4 === 0) {
        setSessionType("longBreak");
        setSecondsLeft(TIMER_CONFIG.longBreak);
      } else {
        setSessionType("break");
        setSecondsLeft(TIMER_CONFIG.break);
      }
    } else {
      setSessionType("work");
      setSecondsLeft(TIMER_CONFIG.work);
    }
  }, [sessionType, sessions, setSessions]);

  const startTimer = () => {
    setMotivation(getMotivation(isDeepWork ? "deepWork" : sessionType));
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (isDeepWork) {
      setDeepWorkStart(null);
      setDeepWorkElapsed(0);
    } else {
      setSecondsLeft(TIMER_CONFIG[sessionType]);
    }
  };

  const toggleDeepWork = () => {
    setIsRunning(false);
    if (!isDeepWork) {
      setIsDeepWork(true);
      setDeepWorkStart(Date.now());
      setDeepWorkElapsed(0);
    } else {
      if (deepWorkStart && deepWorkElapsed > 0) {
        const newSession: Session = {
          date: formatDateKey(new Date()),
          duration: deepWorkElapsed,
          type: "deepWork",
        };
        setSessions((prev) => [...prev, newSession]);
      }
      setIsDeepWork(false);
      setDeepWorkStart(null);
      setDeepWorkElapsed(0);
      setSessionType("work");
      setSecondsLeft(TIMER_CONFIG.work);
    }
  };

  const switchSessionType = (type: SessionType) => {
    if (isRunning || isDeepWork) return;
    setSessionType(type);
    setSecondsLeft(TIMER_CONFIG[type === "deepWork" ? "work" : type]);
    setMotivation(getMotivation(type));
  };

  const deleteSession = (index: number) => {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  };

  const totalSeconds = isDeepWork ? deepWorkElapsed : TIMER_CONFIG[sessionType];
  const currentSeconds = isDeepWork ? deepWorkElapsed : secondsLeft;
  const progress = isDeepWork
    ? 0
    : ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const circumference = 2 * Math.PI * 58;
  const dashOffset = circumference - (progress / 100) * circumference;

  const recentSessions = [...sessions].reverse().slice(0, 8);

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Focus Module</h2>
        </div>
        <Badge variant="outline" className="text-accent border-accent">
          {pomodorosToday} pomodoros today
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Timer Section */}
        <div className="flex flex-col items-center flex-1">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={!isDeepWork ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (!isDeepWork) return;
                toggleDeepWork();
              }}
              className={cn(
                !isDeepWork
                  ? "bg-accent text-white"
                  : "text-text-muted border-border",
              )}
            >
              <Timer className="w-4 h-4 mr-1" />
              Timer
            </Button>
            <Button
              variant={isDeepWork ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (isDeepWork) return;
                toggleDeepWork();
              }}
              className={cn(
                isDeepWork
                  ? "bg-accent text-white"
                  : "text-text-muted border-border",
              )}
            >
              <Zap className="w-4 h-4 mr-1" />
              Deep Work
            </Button>
          </div>

          {/* Session Type Tabs */}
          {!isDeepWork && (
            <div className="flex gap-1 mb-6 p-1 bg-background rounded-lg">
              {(["work", "break", "longBreak"] as SessionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => switchSessionType(type)}
                  disabled={isRunning}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    sessionType === type && !isRunning
                      ? "bg-surface-elevated text-text shadow-sm"
                      : "text-text-dim hover:text-text-muted",
                    isRunning && "cursor-not-allowed",
                  )}
                >
                  {type === "work" && (
                    <Timer className="w-3.5 h-3.5 mr-1 inline" />
                  )}
                  {type === "break" && (
                    <Coffee className="w-3.5 h-3.5 mr-1 inline" />
                  )}
                  {type === "longBreak" && (
                    <Moon className="w-3.5 h-3.5 mr-1 inline" />
                  )}
                  {type === "work"
                    ? "Work"
                    : type === "break"
                      ? "Break"
                      : "Long Break"}
                </button>
              ))}
            </div>
          )}

          {/* Circular Progress */}
          <div className="relative w-36 h-36 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-accent"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-bold text-text">
                {formatTime(currentSeconds)}
              </span>
              <span className="text-xs text-text-dim mt-1">
                {isDeepWork
                  ? "Deep Work"
                  : sessionType === "work"
                    ? "Focus"
                    : sessionType === "break"
                      ? "Break"
                      : "Long Break"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              className="border-border text-text-muted hover:text-text"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              onClick={isRunning ? pauseTimer : startTimer}
              className="bg-accent hover:bg-accent/90 text-white px-8"
            >
              {isRunning ? (
                <Pause className="w-5 h-5 mr-2" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {isRunning
                ? "Pause"
                : isDeepWork && deepWorkStart
                  ? "Resume"
                  : "Start"}
            </Button>
          </div>

          {/* Motivation */}
          <AnimatePresence mode="wait">
            <motion.p
              key={motivation}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-text-muted text-center italic"
            >
              {motivation}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Session History */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide">
              Session History
            </h3>
            <Badge variant="secondary" className="text-text-dim">
              {sessions.length} total
            </Badge>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-dim">
              <Timer className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No sessions yet</p>
              <p className="text-xs mt-1">Start your first focus session!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {recentSessions.map((session, i) => {
                const realIndex = sessions.length - 1 - i;
                return (
                  <motion.div
                    key={`${session.date}-${session.duration}-${realIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          session.type === "work"
                            ? "bg-accent"
                            : session.type === "break"
                              ? "bg-green-400"
                              : session.type === "longBreak"
                                ? "bg-blue-400"
                                : "bg-purple-400",
                        )}
                      />
                      <div>
                        <p className="text-sm text-text capitalize">
                          {session.type === "longBreak"
                            ? "Long Break"
                            : session.type === "deepWork"
                              ? "Deep Work"
                              : session.type}
                        </p>
                        <p className="text-xs text-text-dim">{session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-text-muted">
                        {formatTime(session.duration)}
                      </span>
                      <button
                        onClick={() => deleteSession(realIndex)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {sessions.length > 8 && (
            <p className="text-xs text-text-dim text-center mt-3">
              Showing latest 8 of {sessions.length} sessions
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
