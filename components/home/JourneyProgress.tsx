"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Compass,
  FolderGit2,
  Rocket,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface JourneyData {
  daysBuilding: number;
  projectsCreated: number;
  deploymentsMade: number;
  goalsAchieved: number;
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  category: "project" | "deploy" | "learning" | "achievement" | "milestone";
}

const DEFAULT_JOURNEY: JourneyData = {
  daysBuilding: 1,
  projectsCreated: 1,
  deploymentsMade: 0,
  goalsAchieved: 0,
};

const STATS = [
  {
    key: "daysBuilding" as const,
    label: "Days Building",
    icon: Calendar,
    color: "text-blue-400",
  },
  {
    key: "projectsCreated" as const,
    label: "Projects Created",
    icon: FolderGit2,
    color: "text-green-400",
  },
  {
    key: "deploymentsMade" as const,
    label: "Deployments Made",
    icon: Rocket,
    color: "text-purple-400",
  },
  {
    key: "goalsAchieved" as const,
    label: "Goals Achieved",
    icon: Trophy,
    color: "text-yellow-400",
  },
];

function toSafeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeJourneyData(value: JourneyData | Milestone[] | unknown): JourneyData {
  if (Array.isArray(value)) {
    const milestones = value as Milestone[];
    if (milestones.length === 0) return DEFAULT_JOURNEY;

    const timestamps = milestones
      .map((milestone) => new Date(milestone.date).getTime())
      .filter(Number.isFinite);
    const firstTimestamp = timestamps.length ? Math.min(...timestamps) : Date.now();
    const daysBuilding = Math.max(
      1,
      Math.ceil((Date.now() - firstTimestamp) / (24 * 60 * 60 * 1000)) + 1,
    );

    return {
      daysBuilding,
      projectsCreated: milestones.filter((m) => m.category === "project").length,
      deploymentsMade: milestones.filter((m) => m.category === "deploy").length,
      goalsAchieved: milestones.filter((m) =>
        ["achievement", "milestone", "learning"].includes(m.category),
      ).length,
    };
  }

  const journey = value as Partial<JourneyData> | null | undefined;
  return {
    daysBuilding: toSafeNumber(journey?.daysBuilding, DEFAULT_JOURNEY.daysBuilding),
    projectsCreated: toSafeNumber(
      journey?.projectsCreated,
      DEFAULT_JOURNEY.projectsCreated,
    ),
    deploymentsMade: toSafeNumber(
      journey?.deploymentsMade,
      DEFAULT_JOURNEY.deploymentsMade,
    ),
    goalsAchieved: toSafeNumber(journey?.goalsAchieved, DEFAULT_JOURNEY.goalsAchieved),
  };
}

function CircularProgress({ value, max }: { value: number; max: number }) {
  const safeValue = toSafeNumber(value);
  const safeMax = Math.max(toSafeNumber(max, 100), 1);
  const percentage = Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-24 w-24">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-border"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-accent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-text text-xl font-bold">
          {Math.round(percentage)}%
        </span>
        <span className="text-text-dim text-[10px]">complete</span>
      </div>
    </div>
  );
}

export default function JourneyProgress() {
  const [storedJourney] = useLocalStorage<JourneyData | Milestone[]>(
    "dexter.journey",
    DEFAULT_JOURNEY,
  );

  const journey = useMemo(
    () => normalizeJourneyData(storedJourney),
    [storedJourney],
  );

  const totalScore = useMemo(
    () =>
      journey.daysBuilding +
      journey.projectsCreated +
      journey.deploymentsMade +
      journey.goalsAchieved,
    [journey],
  );
  const maxScore = 100;

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <Compass className="h-4 w-4 text-accent" />
          Journey Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-6">
          <CircularProgress value={totalScore} max={maxScore} />
          <div className="grid grid-cols-2 gap-3 flex-1">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              const value = toSafeNumber(journey[stat.key]);
              return (
                <motion.div
                  key={stat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", stat.color)} />
                  <div className="min-w-0">
                    <span className="text-text text-sm font-semibold block leading-none">
                      {value}
                    </span>
                    <span className="text-text-dim text-[10px] leading-none truncate block">
                      {stat.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("dexter:navigate", { detail: { view: "journey" } }),
            )
          }
          className="w-full text-accent hover:text-accent/80 hover:bg-accent/10 text-xs justify-between"
        >
          View Full Journey
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
