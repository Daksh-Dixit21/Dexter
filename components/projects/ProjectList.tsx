"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Plus,
  GitBranch,
  ExternalLink,
  Rocket,
  Trash2,
  ChevronDown,
  ChevronUp,
  Activity,
  FileText,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  description: string;
  repo: string;
  status: "active" | "archived" | "paused";
  health: "green" | "yellow" | "red";
  notes: string;
  lastActivity: number;
  deployUrl?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-dexter",
    name: "Dexter",
    description: "A calm builder companion for modern developers.",
    repo: "dexter-dev",
    status: "active",
    health: "green",
    notes: "",
    lastActivity: Date.now() - 3600000,
    deployUrl: "https://dexter.vercel.app",
  },
];

function statusConfig(status: Project["status"]) {
  switch (status) {
    case "active":
      return { text: "Active", badgeClass: "bg-green-500/20 text-green-400 border-green-500/30" };
    case "paused":
      return { text: "Paused", badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    case "archived":
      return { text: "Archived", badgeClass: "bg-surface-elevated text-text-dim border-border" };
  }
}

function healthConfig(health: Project["health"]) {
  switch (health) {
    case "green":
      return { color: "bg-green-400", label: "Healthy" };
    case "yellow":
      return { color: "bg-yellow-400", label: "Degraded" };
    case "red":
      return { color: "bg-red-400", label: "Unhealthy" };
  }
}

export default function ProjectList() {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    "dexter.projects",
    DEFAULT_PROJECTS
  );
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | Project["status"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newRepo, setNewRepo] = useState("");

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      description: "",
      repo: newRepo.trim() || newName.trim().toLowerCase().replace(/\s+/g, "-"),
      status: "active",
      health: "green",
      notes: "",
      lastActivity: Date.now(),
    };
    setProjects((prev) => [project, ...prev]);
    setNewName("");
    setNewRepo("");
    setShowForm(false);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, lastActivity: Date.now() } : p))
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filters: { key: "all" | Project["status"]; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-lg font-semibold flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-accent" />
            Projects
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-accent text-background hover:bg-accent/90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
          {!showForm && "New Project"}
        </Button>
      </div>

      <div className="flex gap-1">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={cn(
              "text-xs h-7",
              filter === f.key
                ? "bg-accent text-background"
                : "text-text-muted hover:text-text"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <form onSubmit={addProject} className="space-y-3">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Project name"
                    className="bg-surface-elevated border-border text-text placeholder:text-text-dim"
                  />
                  <Input
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    placeholder="Repository URL"
                    className="bg-surface-elevated border-border text-text placeholder:text-text-dim"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-accent text-background hover:bg-accent/90"
                  >
                    Create Project
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence>
          {filteredProjects.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-text-dim text-sm text-center py-8"
            >
              {filter === "all"
                ? "No projects yet. Create one to get started."
                : `No ${filter} projects.`}
            </motion.p>
          ) : (
            filteredProjects.map((project, idx) => {
              const sConfig = statusConfig(project.status);
              const hConfig = healthConfig(project.health);
              const isExpanded = expandedId === project.id;

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className="overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-elevated/30 transition-colors"
                      onClick={() => toggleExpand(project.id)}
                    >
                      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", hConfig.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-text text-sm font-medium truncate">
                            {project.name}
                          </span>
                          <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", sConfig.badgeClass)}>
                            {sConfig.text}
                          </Badge>
                        </div>
                        {project.description && !isExpanded && (
                          <p className="text-text-muted text-xs truncate mt-0.5">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-text-dim text-xs hidden sm:block">
                          {formatRelativeTime(new Date(project.lastActivity))}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-text-dim" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-text-dim" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator className="bg-border" />
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <label className="text-text-muted text-xs font-medium">Description</label>
                              <Input
                                value={project.description}
                                onChange={(e) =>
                                  updateProject(project.id, { description: e.target.value })
                                }
                                placeholder="Add a description..."
                                className="bg-surface-elevated border-border text-text placeholder:text-text-dim h-8 text-sm"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-text-muted text-xs font-medium">Status</label>
                              <div className="flex gap-1">
                                {(["active", "paused", "archived"] as const).map((s) => {
                                  const cfg = statusConfig(s);
                                  return (
                                    <Button
                                      key={s}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateProject(project.id, { status: s })}
                                      className={cn(
                                        "text-xs h-7",
                                        project.status === s
                                          ? "bg-accent/20 text-accent border border-accent/30"
                                          : "text-text-muted hover:text-text"
                                      )}
                                    >
                                      {cfg.text}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-text-muted text-xs font-medium">Health</label>
                              <div className="flex gap-1">
                                {(["green", "yellow", "red"] as const).map((h) => {
                                  const cfg = healthConfig(h);
                                  return (
                                    <Button
                                      key={h}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => updateProject(project.id, { health: h })}
                                      className={cn(
                                        "text-xs h-7",
                                        project.health === h
                                          ? "bg-surface-elevated text-text"
                                          : "text-text-muted hover:text-text"
                                      )}
                                    >
                                      <div className={cn("h-2 w-2 rounded-full mr-1.5", cfg.color)} />
                                      {cfg.label}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-text-muted text-xs font-medium flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Notes
                              </label>
                              <textarea
                                value={project.notes}
                                onChange={(e) =>
                                  updateProject(project.id, { notes: e.target.value })
                                }
                                placeholder="Add notes about this project..."
                                rows={3}
                                className="w-full bg-surface-elevated border border-border rounded-md px-3 py-2 text-text text-sm placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-text-dim hover:text-accent text-xs"
                                  asChild
                                >
                                  <a
                                    href={`https://github.com/${project.repo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <GitBranch className="h-3 w-3 mr-1" />
                                    Repository
                                  </a>
                                </Button>
                                {project.deployUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-text-dim hover:text-accent text-xs"
                                    asChild
                                  >
                                    <a
                                      href={project.deployUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      Deploy
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-text-dim hover:text-accent text-xs"
                                >
                                  <Activity className="h-3 w-3 mr-1" />
                                  Actions
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteProject(project.id)}
                                className="h-7 px-2 text-text-dim hover:text-red-400 text-xs"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
