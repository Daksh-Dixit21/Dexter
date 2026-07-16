"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Eye,
  Folder,
  Home,
  Rocket,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AppDockProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: "home", label: "Home", icon: Home, color: "#6366f1" },
  { id: "deploy", label: "Deploy", icon: Rocket, color: "#10b981" },
  { id: "projects", label: "Repos", icon: Folder, color: "#8b5cf6" },
  { id: "reading", label: "Tasks", icon: BookOpen, color: "#ec4899" },
  { id: "focus", label: "Focus", icon: Target, color: "#f59e0b" },
  { id: "vision", label: "Vision", icon: Eye, color: "#14b8a6" },
  { id: "journey", label: "Journey", icon: Calendar, color: "#6366f1" },
];

export function AppDock({ activeView, onNavigate }: AppDockProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center pb-3 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="pointer-events-auto flex items-center gap-1 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border px-3 py-2 shadow-2xl"
        role="toolbar"
        aria-label="Application dock"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isHov = hovered === item.id;

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHov && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-text shadow-md pointer-events-none select-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Icon button */}
              <motion.button
                onClick={() => onNavigate(item.id)}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150",
                  isActive
                    ? "text-white"
                    : "text-text-muted hover:text-text",
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: item.color + "22",
                        boxShadow: `0 0 14px ${item.color}55`,
                        color: item.color,
                        border: `1px solid ${item.color}44`,
                      }
                    : {}
                }
                aria-label={item.label}
                aria-pressed={isActive}
              >
                <Icon className="h-5 w-5" />
                {/* Active dot */}
                {isActive && (
                  <motion.span
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </motion.button>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Settings */}
        <div
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovered("settings")}
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence>
            {hovered === "settings" && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-text shadow-md pointer-events-none select-none"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          <motion.div
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/settings"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-text-muted hover:text-text transition-colors duration-150"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}
