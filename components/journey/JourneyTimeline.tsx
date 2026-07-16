"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Plus,
  Trash2,
  Code,
  Upload,
  TrendingUp,
  DollarSign,
  User,
  X,
  Check,
  Calendar,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

type MilestoneCategory = "Code" | "Deploy" | "Growth" | "Revenue" | "Personal";

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  category: MilestoneCategory;
  createdAt: string;
}

const CATEGORIES: MilestoneCategory[] = ["Code", "Deploy", "Growth", "Revenue", "Personal"];

const CATEGORY_CONFIG: Record<MilestoneCategory, { icon: React.ElementType; color: string; bg: string }> = {
  Code: { icon: Code, color: "text-blue-400", bg: "bg-blue-400" },
  Deploy: { icon: Upload, color: "text-green-400", bg: "bg-green-400" },
  Growth: { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400" },
  Revenue: { icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-400" },
  Personal: { icon: User, color: "text-pink-400", bg: "bg-pink-400" },
};

const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: "sample-1",
    title: "Started Building",
    description: "Had the idea and decided to start building Dexter, a calm builder companion.",
    date: "2024-01-15",
    category: "Personal",
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "sample-2",
    title: "Connected GitHub",
    description: "Set up repository and connected version control.",
    date: "2024-01-20",
    category: "Code",
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "sample-3",
    title: "First Commit",
    description: "Made the initial commit with project scaffolding.",
    date: "2024-01-22",
    category: "Code",
    createdAt: "2024-01-22T00:00:00.000Z",
  },
  {
    id: "sample-4",
    title: "First Deployment",
    description: "Successfully deployed the first version to production.",
    date: "2024-03-10",
    category: "Deploy",
    createdAt: "2024-03-10T00:00:00.000Z",
  },
  {
    id: "sample-5",
    title: "First Beta User",
    description: "Got our first beta user to try out the product!",
    date: "2024-04-05",
    category: "Growth",
    createdAt: "2024-04-05T00:00:00.000Z",
  },
];

function generateId(): string {
  return `milestone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JourneyTimeline() {
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(
    "dexter.journey",
    SAMPLE_MILESTONES
  );
  const [isAdding, setIsAdding] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState<MilestoneCategory>("Code");

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormCategory("Code");
  };

  const handleAdd = () => {
    if (!formTitle.trim()) return;
    const newMilestone: Milestone = {
      id: generateId(),
      title: formTitle.trim(),
      description: formDescription.trim(),
      date: formDate,
      category: formCategory,
      createdAt: new Date().toISOString(),
    };
    setMilestones((prev) => [...prev, newMilestone]);
    resetForm();
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Card className="p-6 bg-surface border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-text">Journey Timeline</h2>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-text-muted border-border">
            {milestones.length} milestones
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-accent hover:bg-accent/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Milestone
          </Button>
        </div>
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
                <h3 className="text-sm font-medium text-text">New Milestone</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Milestone title"
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
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-surface border-border text-text"
                />
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MilestoneCategory)}
                  className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                  disabled={!formTitle.trim()}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {sortedMilestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-dim">
          <MapPin className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No milestones yet. Start your journey!</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            <AnimatePresence>
              {sortedMilestones.map((milestone, index) => {
                const catConfig = CATEGORY_CONFIG[milestone.category];
                const CatIcon = catConfig.icon;
                const isLast = index === sortedMilestones.length - 1;

                return (
                  <motion.div
                    key={milestone.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4 md:gap-6 group"
                  >
                    {/* Dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={cn(
                          "w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center",
                          "bg-surface-elevated border-2",
                          catConfig.color,
                          "border-current"
                        )}
                      >
                        <CatIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                    </div>

                    {/* Content */}
                    <Card className="flex-1 p-4 bg-background border-border hover:border-accent/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-text">{milestone.title}</h3>
                            <Badge
                              variant="secondary"
                              className={cn("text-xs", catConfig.color)}
                            >
                              {milestone.category}
                            </Badge>
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-text-muted mb-2">
                              {milestone.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-xs text-text-dim">
                            <Calendar className="w-3 h-3" />
                            {formatDate(milestone.date)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(milestone.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-dim hover:text-red-400 rounded ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Card>
  );
}
