"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  RefreshCw,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QUOTES } from "@/lib/constants";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";

interface VisionGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  status: string;
  createdAt: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  projectLink: string;
  recurring: string;
  createdAt: string;
  completedAt: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "\u{1F319}";
  if (hour < 12) return "\u{2600}\u{FE0F}";
  if (hour < 17) return "\u{1F324}\u{FE0F}";
  if (hour < 21) return "\u{1F305}";
  return "\u{1F319}";
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

function isUpcoming(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr > today;
}

function getRandomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function formatTimestamp(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MorningBrief() {
  const [visionBoard] = useLocalStorage<VisionGoal[]>("dexter.visionBoard", []);
  const [todos] = useLocalStorage<Todo[]>("dexter.todos", []);
  const [focusSessions] = useLocalStorage<
    { date: string; duration: number; type: string }[]
  >("dexter.focusSessions", []);
  const [quote, setQuote] = useState(getRandomQuote);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toISOString());

  const todayKey = new Date().toISOString().split("T")[0];

  const activeTodos = todos.filter((t) => !t.completed);
  const todayTodos = todos.filter((t) => !t.completed && isToday(t.dueDate));
  const completedTodos = todos.filter((t) => t.completed);

  const topGoal = visionBoard.length > 0 ? visionBoard[0] : null;

  const todaySessions = focusSessions.filter((s) => s.date === todayKey);
  const totalFocusMinutes = todaySessions.reduce(
    (acc, s) => acc + Math.round(s.duration / 60),
    0,
  );

  const recentActivity = useMemo(() => {
    const activities: {
      text: string;
      time: string;
      icon: React.ElementType;
      color: string;
    }[] = [];

    const recentCompleted = [...todos]
      .filter((t) => t.completedAt)
      .sort(
        (a, b) =>
          new Date(b.completedAt!).getTime() -
          new Date(a.completedAt!).getTime(),
      )
      .slice(0, 3);

    recentCompleted.forEach((t) => {
      activities.push({
        text: `Completed "${t.text}"`,
        time: formatTimestamp(t.completedAt!),
        icon: CheckCircle2,
        color: "text-green-400",
      });
    });

    todaySessions.forEach((s) => {
      activities.push({
        text: `${s.type === "deepWork" ? "Deep Work" : s.type === "work" ? "Focus" : "Break"} session — ${Math.round(s.duration / 60)}min`,
        time: "Today",
        icon: Clock,
        color: "text-accent",
      });
    });

    return activities.slice(0, 5);
  }, [todos, todaySessions]);

  const handleRefresh = () => {
    setQuote(getRandomQuote());
    setLastRefreshed(new Date().toISOString());
  };

  return (
    <Card className="p-6 bg-surface border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-xl">{getGreetingEmoji()}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Quick Briefing</h2>
            <p className="text-xs text-text-dim">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className="border-border text-text-muted hover:text-text"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Today's Focus */}
        <div className="p-4 rounded-lg bg-background border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium text-text">
              Today&apos;s Focus
            </h3>
          </div>
          {topGoal ? (
            <div>
              <p className="text-sm font-medium text-text">{topGoal.title}</p>
              {topGoal.description && (
                <p className="text-xs text-text-muted mt-1 line-clamp-2">
                  {topGoal.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px]">
                  {topGoal.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    topGoal.status === "achieved"
                      ? "bg-green-500/20 text-green-400"
                      : topGoal.status === "in_progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-gray-500/20 text-gray-400",
                  )}
                >
                  {topGoal.status === "not_started"
                    ? "Not Started"
                    : topGoal.status === "in_progress"
                      ? "In Progress"
                      : "Achieved"}
                </Badge>
                {topGoal.targetDate && (
                  <span className="text-[10px] text-text-dim">
                    Due {formatDate(topGoal.targetDate)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-dim">
              No goals set yet. Create a vision to get started!
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-background border border-border text-center">
            <p className="text-2xl font-bold text-text">{activeTodos.length}</p>
            <p className="text-[10px] text-text-dim uppercase tracking-wide mt-0.5">
              Active Todos
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border text-center">
            <p className="text-2xl font-bold text-text">{todayTodos.length}</p>
            <p className="text-[10px] text-text-dim uppercase tracking-wide mt-0.5">
              Due Today
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background border border-border text-center">
            <p className="text-2xl font-bold text-text">{totalFocusMinutes}m</p>
            <p className="text-[10px] text-text-dim uppercase tracking-wide mt-0.5">
              Focus Time
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="p-4 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-medium text-text">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {recentActivity.map((activity, i) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <ActivityIcon
                      className={cn(
                        "w-3.5 h-3.5 flex-shrink-0",
                        activity.color,
                      )}
                    />
                    <span className="text-text-muted truncate flex-1">
                      {activity.text}
                    </span>
                    <span className="text-text-dim flex-shrink-0">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Motivational Insight */}
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium text-accent">
              Motivational Insight
            </h3>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-text-muted italic"
            >
              &ldquo;{quote}&rdquo;
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <p className="text-[10px] text-text-dim">
          Last refreshed: {formatTimestamp(lastRefreshed)}
        </p>
        <p className="text-[10px] text-text-dim">
          {visionBoard.length} goals · {todos.length} todos ·{" "}
          {focusSessions.length} sessions
        </p>
      </div>
    </Card>
  );
}
