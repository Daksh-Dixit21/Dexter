"use client";

import { Home, Rocket, Folder, BookOpen, Target, Eye, Calendar, Settings } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import Link from "next/link";

interface AppDockProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: <Home className="h-full w-full" />, color: "#6366f1" },
  { id: "deploy", label: "Deploy", icon: <Rocket className="h-full w-full" />, color: "#10b981" },
  { id: "projects", label: "Projects", icon: <Folder className="h-full w-full" />, color: "#8b5cf6" },
  { id: "reading", label: "Reading", icon: <BookOpen className="h-full w-full" />, color: "#ec4899" },
  { id: "focus", label: "Focus", icon: <Target className="h-full w-full" />, color: "#f59e0b" },
  { id: "vision", label: "Vision", icon: <Eye className="h-full w-full" />, color: "#14b8a6" },
  { id: "journey", label: "Journey", icon: <Calendar className="h-full w-full" />, color: "#6366f1" },
];

export function AppDock({ activeView, onNavigate }: AppDockProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 -translate-x-1/2 pb-2">
      <Dock className="items-end pb-2" magnification={70} distance={120} panelHeight={52}>
        {navItems.map((item) => (
          <DockItem
            key={item.id}
            className={`aspect-square rounded-full bg-surface-elevated border transition-all ${
              activeView === item.id ? "border-accent/50" : "border-border"
            }`}
          >
            <DockLabel>{item.label}</DockLabel>
            <DockIcon>
              <button
                onClick={() => {
                  if (item.id === "settings") return;
                  onNavigate(item.id);
                }}
                style={{ color: activeView === item.id ? item.color : undefined }}
              >
                {item.icon}
              </button>
            </DockIcon>
          </DockItem>
        ))}
        <DockItem className="aspect-square rounded-full bg-surface-elevated border border-border">
          <DockLabel>Settings</DockLabel>
          <DockIcon>
            <Link href="/settings">
              <Settings className="h-full w-full text-text-muted" />
            </Link>
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
}
