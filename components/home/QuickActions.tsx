"use client";

import { Card } from "@/components/ui/card";
import { Rocket, Plus, Clock, Target, Eye, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

const QUICK_ACTIONS = [
  { id: "set-mission", label: "Set Mission", icon: Target, href: "/?tab=home" },
  { id: "focus", label: "Start Focus", icon: Clock, href: "/?tab=focus" },
  { id: "add-todo", label: "Quick Todo", icon: Plus, href: "/?tab=reading" },
  { id: "deploy", label: "Deploy", icon: Rocket, href: "/?tab=deploy" },
  { id: "projects", label: "Projects", icon: Eye, href: "/?tab=projects" },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Card
          key={action.id}
          className="flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:border-accent/50 hover:shadow-md transition-all duration-150 active:scale-[0.98]"
          onClick={() => router.push(action.href)}
        >
          <action.icon className="h-5 w-5 text-text-muted" />
          <span className="text-xs font-medium text-text text-center">{action.label}</span>
        </Card>
      ))}
    </div>
  );
}
