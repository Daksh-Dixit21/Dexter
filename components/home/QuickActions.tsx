"use client";

import { Clock, Eye, Plus, Rocket, Target } from "lucide-react";
import { Card } from "@/components/ui/card";

const QUICK_ACTIONS = [
  { id: "set-mission", label: "Set Mission", icon: Target, view: "home" },
  { id: "focus", label: "Start Focus", icon: Clock, view: "focus" },
  { id: "add-todo", label: "Quick Todo", icon: Plus, view: "reading" },
  { id: "deploy", label: "Deploy", icon: Rocket, view: "deploy" },
  { id: "projects", label: "Projects", icon: Eye, view: "projects" },
];

export function QuickActions() {
  const navigate = (view: string) => {
    window.dispatchEvent(
      new CustomEvent("dexter:navigate", { detail: { view } }),
    );
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Card
          key={action.id}
          className="flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:border-accent/50 hover:shadow-md transition-all duration-150 active:scale-[0.98]"
          onClick={() => navigate(action.view)}
        >
          <action.icon className="h-5 w-5 text-text-muted" />
          <span className="text-xs font-medium text-text text-center">
            {action.label}
          </span>
        </Card>
      ))}
    </div>
  );
}
