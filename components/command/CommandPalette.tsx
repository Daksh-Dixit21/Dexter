"use client";

import { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Rocket, GitBranch, BookOpen, Settings, Home, Plus, Search,
  Target, Clock, Eye, Calendar, Layout, Folder, Bell, Moon, Sun,
  Terminal, Globe, RefreshCw, Copy, ExternalLink, Star, Zap
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const commands = [
  { id: "home", label: "Go Home", icon: Home, category: "Navigation", action: "navigate", href: "/?tab=home" },
  { id: "deploy", label: "View Deployments", icon: Rocket, category: "Navigation", action: "navigate", href: "/?tab=deploy" },
  { id: "actions", label: "Recent Activity", icon: GitBranch, category: "Navigation", action: "navigate", href: "/?tab=actions" },
  { id: "reading", label: "Reading List", icon: BookOpen, category: "Navigation", action: "navigate", href: "/?tab=reading" },
  { id: "projects", label: "Projects", icon: Folder, category: "Navigation", action: "navigate", href: "/?tab=projects" },
  { id: "focus", label: "Focus Mode", icon: Target, category: "Navigation", action: "navigate", href: "/?tab=focus" },
  { id: "vision", label: "Vision Board", icon: Eye, category: "Navigation", action: "navigate", href: "/?tab=vision" },
  { id: "journey", label: "Journey Timeline", icon: Calendar, category: "Navigation", action: "navigate", href: "/?tab=journey" },
  { id: "settings", label: "Settings", icon: Settings, category: "Navigation", action: "navigate", href: "/settings" },
  { id: "new-todo", label: "Add Todo", icon: Plus, category: "Actions", action: "addTodo" },
  { id: "new-reminder", label: "Add Reminder", icon: Bell, category: "Actions", action: "addReminder" },
  { id: "new-reading", label: "Add Reading Link", icon: Plus, category: "Actions", action: "addReading" },
  { id: "new-mission", label: "Set Today's Mission", icon: Target, category: "Actions", action: "setMission" },
  { id: "start-focus", label: "Start Focus Session", icon: Clock, category: "Actions", action: "startFocus" },
  { id: "new-project", label: "Add Project", icon: Folder, category: "Actions", action: "addProject" },
  { id: "theme-toggle", label: "Toggle Theme", icon: Moon, category: "Settings", action: "toggleTheme" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("dexter.theme", "dark");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback(
    (command: (typeof commands)[0]) => {
      setOpen(false);
      switch (command.action) {
        case "navigate":
          if (command.href) router.push(command.href);
          break;
        case "toggleTheme":
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          document.documentElement.classList.toggle("dark", newTheme === "dark");
          break;
        case "startFocus":
          router.push("/?tab=focus");
          break;
        case "setMission":
        case "addTodo":
        case "addReminder":
        case "addReading":
        case "addProject":
          router.push("/");
          break;
        default:
          break;
      }
    },
    [router, theme, setTheme],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-[550px] overflow-hidden bg-surface border-border">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-text-dim disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[350px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation" className="text-text-muted">
              {commands.filter(c => c.category === "Navigation").map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => runCommand(command)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none aria-selected:bg-surface-elevated data-[selected]:bg-surface-elevated"
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions" className="text-text-muted">
              {commands.filter(c => c.category === "Actions").map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => runCommand(command)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none aria-selected:bg-surface-elevated data-[selected]:bg-surface-elevated"
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Settings" className="text-text-muted">
              {commands.filter(c => c.category === "Settings").map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => runCommand(command)}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none aria-selected:bg-surface-elevated data-[selected]:bg-surface-elevated"
                >
                  <command.icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
