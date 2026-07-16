"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListTodo,
  Plus,
  Trash2,
  Check,
  Calendar,
  Link as LinkIcon,
  Repeat,
  X,
  Circle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type RecurringType = "none" | "daily" | "weekly" | "monthly";
type FilterTab = "all" | "today" | "upcoming" | "completed";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string;
  projectLink: string;
  recurring: RecurringType;
  createdAt: string;
  completedAt: string | null;
}

function generateId(): string {
  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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

function formatDueDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const RECURRING_OPTIONS: { value: RecurringType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function TodoSystem() {
  const [todos, setTodos] = useLocalStorage<Todo[]>("dexter.todos", []);
  const [isAdding, setIsAdding] = useState(false);
  const [formText, setFormText] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formProjectLink, setFormProjectLink] = useState("");
  const [formRecurring, setFormRecurring] = useState<RecurringType>("none");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const resetForm = () => {
    setFormText("");
    setFormDueDate("");
    setFormProjectLink("");
    setFormRecurring("none");
  };

  const handleAdd = () => {
    if (!formText.trim()) return;
    const newTodo: Todo = {
      id: generateId(),
      text: formText.trim(),
      completed: false,
      dueDate: formDueDate,
      projectLink: formProjectLink.trim(),
      recurring: formRecurring,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTodos((prev) => [...prev, newTodo]);
    resetForm();
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : null,
            }
          : t
      )
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = useMemo(() => {
    switch (activeTab) {
      case "today":
        return todos.filter((t) => !t.completed && isToday(t.dueDate));
      case "upcoming":
        return todos.filter((t) => !t.completed && isUpcoming(t.dueDate));
      case "completed":
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }, [todos, activeTab]);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const todayTodos = todos.filter((t) => !t.completed && isToday(t.dueDate));

  const tabCounts: Record<FilterTab, number> = {
    all: activeTodos.length,
    today: todayTodos.length,
    upcoming: todos.filter((t) => !t.completed && isUpcoming(t.dueDate)).length,
    completed: completedTodos.length,
  };

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Todos</h2>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Todo
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-background rounded-lg">
        {(["all", "today", "upcoming", "completed"] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
              activeTab === tab
                ? "bg-surface-elevated text-text shadow-sm"
                : "text-text-dim hover:text-text-muted"
            )}
          >
            {tab}
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0",
                tab === activeTab ? "bg-accent/20 text-accent" : "bg-border text-text-dim"
              )}
            >
              {tabCounts[tab]}
            </Badge>
          </button>
        ))}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-4 bg-background border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-text">New Todo</h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="text-text-dim hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="What needs to be done?"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                  }}
                  className="bg-surface border-border text-text"
                  autoFocus
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-text-dim flex-shrink-0" />
                    <Input
                      type="date"
                      placeholder="Due date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="bg-surface border-border text-text text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-text-dim flex-shrink-0" />
                    <Input
                      placeholder="Project link"
                      value={formProjectLink}
                      onChange={(e) => setFormProjectLink(e.target.value)}
                      className="bg-surface border-border text-text text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-text-dim flex-shrink-0" />
                    <select
                      value={formRecurring}
                      onChange={(e) => setFormRecurring(e.target.value as RecurringType)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {RECURRING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="border-border text-text-muted"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="bg-accent hover:bg-accent/90 text-white"
                  disabled={!formText.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-dim">
          <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">
            {activeTab === "completed"
              ? "No completed todos yet."
              : activeTab === "today"
              ? "No todos due today."
              : activeTab === "upcoming"
              ? "No upcoming todos."
              : "All clear! Add a todo to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group"
              >
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    todo.completed
                      ? "bg-background/50 border-border/50"
                      : "bg-background border-border hover:border-accent/30"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className="flex-shrink-0"
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-dim hover:text-accent transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        todo.completed ? "text-text-dim line-through" : "text-text"
                      )}
                    >
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {todo.dueDate && (
                        <span
                          className={cn(
                            "text-xs flex items-center gap-1",
                            isToday(todo.dueDate) && !todo.completed
                              ? "text-orange-400"
                              : "text-text-dim"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {formatDueDate(todo.dueDate)}
                        </span>
                      )}
                      {todo.projectLink && (
                        <a
                          href={todo.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent flex items-center gap-1 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-3 h-3" />
                          Project
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                      {todo.recurring !== "none" && (
                        <span className="text-xs text-text-dim flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {todo.recurring}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-dim hover:text-red-400 rounded flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary */}
      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-dim text-center">
            {activeTodos.length} active · {completedTodos.length} completed · {todos.length} total
          </p>
        </div>
      )}
    </Card>
  );
}
