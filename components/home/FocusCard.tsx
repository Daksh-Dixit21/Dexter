"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Play, Square, Timer, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface FocusSession {
  active: boolean;
  startTime: number;
  type: "pomodoro" | "deep";
}

function formatElapsed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function FocusCard() {
  const [session, setSession] = useLocalStorage<FocusSession | null>(
    "dexter.focusSession",
    null,
  );
  const [elapsed, setElapsed] = useState(0);

  const updateElapsed = useCallback(() => {
    if (session?.active && session.startTime) {
      setElapsed(Math.floor((Date.now() - session.startTime) / 1000));
    }
  }, [session?.active, session?.startTime]);

  useEffect(() => {
    if (session?.active) {
      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [session?.active, updateElapsed]);

  const startSession = (type: "pomodoro" | "deep") => {
    setSession({ active: true, startTime: Date.now(), type });
  };

  const stopSession = () => {
    setSession(null);
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <Timer className="h-4 w-4 text-accent" />
          Focus Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {session?.active ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    session.type === "pomodoro"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-purple-500/20 text-purple-400 border-purple-500/30",
                  )}
                >
                  {session.type === "pomodoro" ? (
                    <Coffee className="h-3 w-3 mr-1" />
                  ) : (
                    <Zap className="h-3 w-3 mr-1" />
                  )}
                  {session.type === "pomodoro" ? "Pomodoro" : "Deep Work"}
                </Badge>
              </div>

              <motion.div
                className="text-center py-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-3xl font-mono font-bold text-text tabular-nums">
                  {formatElapsed(elapsed)}
                </span>
              </motion.div>

              <div className="flex gap-2">
                <Button
                  onClick={stopSession}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Square className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <p className="text-text-muted text-sm">Start a focus session</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => startSession("pomodoro")}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-text hover:bg-surface-elevated"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Pomodoro
                </Button>
                <Button
                  onClick={() => startSession("deep")}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-text hover:bg-surface-elevated"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Deep Work
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
