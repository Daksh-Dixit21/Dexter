"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface Mission {
  text: string;
  completed: boolean;
  completedAt?: string;
}

export default function TodayMission() {
  const [mission, setMission] = useLocalStorage<Mission | null>(
    "dexter.todayMission",
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (mission?.completed) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [mission?.completed]);

  useEffect(() => {
    const handler = (event: Event) => {
      if ((event as CustomEvent<{ action: string }>).detail.action !== "setMission") {
        return;
      }
      setMission(null);
      setInputValue("");
    };
    window.addEventListener("dexter:command-action", handler);
    return () => window.removeEventListener("dexter:command-action", handler);
  }, [setMission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMission({ text: inputValue.trim(), completed: false });
      setInputValue("");
    }
  };

  const handleComplete = () => {
    if (mission && !mission.completed) {
      setMission({
        ...mission,
        completed: true,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const handleReset = () => {
    setMission(null);
    setInputValue("");
  };

  return (
    <Card className="border-accent/30 relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <Target className="h-4 w-4 text-accent" />
          Today&apos;s Mission
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {!mission ? (
            <motion.form
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-3"
            >
              <p className="text-text-muted text-sm">
                What&apos;s your mission today?
              </p>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ship that feature..."
                  className="flex-1 bg-surface-elevated border-border text-text placeholder:text-text-dim"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-accent text-background hover:bg-accent/90"
                >
                  Set
                </Button>
              </div>
            </motion.form>
          ) : mission.completed ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 py-2"
            >
              <AnimatePresence>
                {showCelebration && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Sparkles className="h-6 w-6 text-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">
                  Mission complete!
                </span>
              </motion.div>
              <p className="text-text text-sm text-center line-through opacity-60">
                {mission.text}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-text-muted hover:text-text text-xs"
              >
                Set new mission
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3"
            >
              <button onClick={handleComplete} className="mt-0.5 shrink-0">
                <Circle className="h-5 w-5 text-accent hover:text-accent/80 transition-colors" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-text text-sm leading-relaxed">
                  {mission.text}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-text-dim hover:text-text-muted text-xs shrink-0"
              >
                Clear
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
