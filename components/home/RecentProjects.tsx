"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Plus,
  GitBranch,
  Trash2,
  ExternalLink,
  X,
  Rocket,
  Pause,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  repo: string;
  status: "active" | "archived" | "paused";
  lastActivity: number;
  deployUrl?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-dexter",
    name: "Dexter",
    repo: "dexter-dev",
    status: "active",
    lastActivity: Date.now() - 3600000,
    deployUrl: "https://dexter.vercel.app",
  },
];

function statusConfig(status: Project["status"]) {
  switch (status) {
    case "active":
      return { color: "bg-green-400", text: "Active", badgeClass: "bg-green-500/20 text-green-400 border-green-500/30", icon: Rocket };
    case "paused":
      return { color: "bg-yellow-400", text: "Paused", badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Pause };
    case "archived":
      return { color: "bg-text-dim", text: "Archived", badgeClass: "bg-surface-elevated text-text-dim border-border", icon: Archive };
  }
}

export default function RecentProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    "dexter.projects",
    DEFAULT_PROJECTS
  );
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRepo, setNewRepo] = useState("");

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      repo: newRepo.trim() || newName.trim().toLowerCase().replace(/\s+/g, "-"),
      status: "active",
      lastActivity: Date.now(),
    };
    setProjects((prev) => [project, ...prev]);
    setNewName("");
    setNewRepo("");
    setShowForm(false);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <FolderOpen className="h-4 w-4 text-accent" />
            Recent Projects
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="text-accent hover:text-accent/80 h-7 px-2 text-xs"
          >
            {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={addProject}
              className="space-y-2 overflow-hidden"
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name"
                className="bg-surface-elevated border-border text-text placeholder:text-text-dim h-8 text-sm"
              />
              <Input
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                placeholder="Repo URL (optional)"
                className="bg-surface-elevated border-border text-text placeholder:text-text-dim h-8 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full bg-accent text-background hover:bg-accent/90 h-8 text-xs"
              >
                Add Project
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <AnimatePresence>
            {projects.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-text-dim text-sm text-center py-4"
              >
                No projects yet. Add one to get started.
              </motion.p>
            ) : (
              projects.map((project, idx) => {
                const config = statusConfig(project.status);
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors group"
                  >
                    <div className={cn("h-2 w-2 rounded-full shrink-0", config.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-text text-sm font-medium truncate">
                          {project.name}
                        </span>
                        <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", config.badgeClass)}>
                          <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                          {config.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-text-dim text-xs flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {project.repo}
                        </span>
                        <span className="text-text-dim text-xs">
                          {formatRelativeTime(new Date(project.lastActivity))}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {project.deployUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-text-dim hover:text-accent"
                          asChild
                        >
                          <a href={project.deployUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="h-6 w-6 p-0 text-text-dim hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
