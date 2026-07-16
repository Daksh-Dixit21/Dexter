"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  X,
  Check,
  TrendingUp,
  Briefcase,
  Heart,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type GoalCategory = "Personal" | "Financial" | "Career" | "Health";
type GoalStatus = "not_started" | "in_progress" | "achieved";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string;
  status: GoalStatus;
  createdAt: string;
}

const CATEGORIES: GoalCategory[] = ["Personal", "Financial", "Career", "Health"];
const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "achieved", label: "Achieved" },
];

const CATEGORY_CONFIG: Record<GoalCategory, { icon: React.ElementType; color: string }> = {
  Personal: { icon: Heart, color: "text-pink-400" },
  Financial: { icon: DollarSign, color: "text-green-400" },
  Career: { icon: Briefcase, color: "text-blue-400" },
  Health: { icon: TrendingUp, color: "text-orange-400" },
};

const STATUS_CONFIG: Record<GoalStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-gray-500/20 text-gray-400" },
  in_progress: { label: "In Progress", className: "bg-blue-500/20 text-blue-400" },
  achieved: { label: "Achieved", className: "bg-green-500/20 text-green-400" },
};

function generateId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const achieved = goals.filter((g) => g.status === "achieved").length;
  return Math.round((achieved / goals.length) * 100);
}

export default function VisionBoard() {
  const [goals, setGoals] = useLocalStorage<Goal[]>("dexter.visionBoard", []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<GoalCategory>("Personal");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<GoalCategory | "All">("All");

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormCategory("Personal");
    setFormTargetDate("");
  };

  const handleAdd = () => {
    if (!formTitle.trim()) return;
    const newGoal: Goal = {
      id: generateId(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      targetDate: formTargetDate,
      status: "not_started",
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    resetForm();
    setIsAdding(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setFormTitle(goal.title);
    setFormDescription(goal.description);
    setFormCategory(goal.category);
    setFormTargetDate(goal.targetDate);
  };

  const handleUpdate = () => {
    if (!editingId || !formTitle.trim()) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === editingId
          ? {
              ...g,
              title: formTitle.trim(),
              description: formDescription.trim(),
              category: formCategory,
              targetDate: formTargetDate,
            }
          : g
      )
    );
    resetForm();
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleStatusChange = (id: string, status: GoalStatus) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status } : g))
    );
  };

  const filteredGoals =
    filterCategory === "All" ? goals : goals.filter((g) => g.category === filterCategory);

  const progress = getProgress(goals);

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Vision Board</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-text-muted border-border">
            {goals.length} goals
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setIsAdding(true);
              setEditingId(null);
            }}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-muted">Overall Progress</span>
          <span className="text-sm font-medium text-text">{progress}%</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-text-dim mt-1">
          {goals.filter((g) => g.status === "achieved").length} of {goals.length} goals achieved
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-background rounded-lg">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              filterCategory === cat
                ? "bg-surface-elevated text-text shadow-sm"
                : "text-text-dim hover:text-text-muted"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <Card className="p-4 bg-background border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-text">
                  {editingId ? "Edit Goal" : "New Goal"}
                </h3>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="text-text-dim hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Goal title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-surface border-border text-text"
                />
                <Input
                  placeholder="Description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-surface border-border text-text"
                />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  placeholder="Target date"
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="bg-surface border-border text-text"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="border-border text-text-muted"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="bg-accent hover:bg-accent/90 text-white"
                  disabled={!formTitle.trim()}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {editingId ? "Update" : "Add Goal"}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-dim">
          <Sparkles className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">
            {goals.length === 0
              ? "No goals yet. Start by adding your first goal!"
              : "No goals in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredGoals.map((goal) => {
              const catConfig = CATEGORY_CONFIG[goal.category];
              const CatIcon = catConfig.icon;
              const statusConfig = STATUS_CONFIG[goal.status];

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group"
                >
                  <Card className="p-4 bg-background border-border hover:border-accent/30 transition-colors h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CatIcon className={cn("w-4 h-4", catConfig.color)} />
                        <Badge variant="secondary" className="text-xs">
                          {goal.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-1 text-text-dim hover:text-text rounded"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-1 text-text-dim hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-medium text-text mb-1">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-text-muted mb-3 line-clamp-2">
                        {goal.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-text-dim">
                        <Calendar className="w-3 h-3" />
                        {goal.targetDate || "No date"}
                      </div>
                      <select
                        value={goal.status}
                        onChange={(e) =>
                          handleStatusChange(goal.id, e.target.value as GoalStatus)
                        }
                        className={cn(
                          "text-xs px-2 py-1 rounded-md border-0 bg-transparent cursor-pointer",
                          statusConfig.className
                        )}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
