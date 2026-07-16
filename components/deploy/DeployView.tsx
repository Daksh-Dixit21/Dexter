"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  ExternalLink,
  RefreshCw,
  FileText,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatRelativeTime, cn } from "@/lib/utils";

interface DeployProject {
  id: string;
  name: string;
  platform: "vercel" | "netlify";
  status: "ready" | "building" | "error";
  url: string;
  lastDeploy: number;
}

const DEFAULT_DEPLOYS: DeployProject[] = [
  {
    id: "dep-1",
    name: "dexter-app",
    platform: "vercel",
    status: "ready",
    url: "https://dexter-app.vercel.app",
    lastDeploy: Date.now() - 7200000,
  },
  {
    id: "dep-2",
    name: "dexter-docs",
    platform: "netlify",
    status: "ready",
    url: "https://dexter-docs.netlify.app",
    lastDeploy: Date.now() - 86400000,
  },
  {
    id: "dep-3",
    name: "dexter-api",
    platform: "vercel",
    status: "building",
    url: "",
    lastDeploy: Date.now() - 300000,
  },
];

interface Integration {
  id: string;
  name: string;
  connected: boolean;
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "vercel", name: "Vercel", connected: true },
  { id: "netlify", name: "Netlify", connected: true },
  { id: "github", name: "GitHub", connected: true },
];

function statusConfig(status: DeployProject["status"]) {
  switch (status) {
    case "ready":
      return { icon: CheckCircle2, color: "text-green-400", badge: "bg-green-500/20 text-green-400 border-green-500/30", label: "Ready" };
    case "building":
      return { icon: Loader2, color: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Building" };
    case "error":
      return { icon: AlertCircle, color: "text-red-400", badge: "bg-red-500/20 text-red-400 border-red-500/30", label: "Error" };
  }
}

function platformIcon(platform: string) {
  return platform === "vercel" ? Cloud : Globe;
}

function Globe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export default function DeployView() {
  const [deploys, setDeploys] = useLocalStorage<DeployProject[]>(
    "dexter.deploys",
    DEFAULT_DEPLOYS
  );
  const [integrations] = useLocalStorage<Integration[]>(
    "dexter.integrations",
    DEFAULT_INTEGRATIONS
  );
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlatform, setNewPlatform] = useState<"vercel" | "netlify">("vercel");

  const addDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const deploy: DeployProject = {
      id: `dep-${Date.now()}`,
      name: newName.trim(),
      platform: newPlatform,
      status: "ready",
      url: `https://${newName.trim()}.${newPlatform === "vercel" ? "vercel.app" : "netlify.app"}`,
      lastDeploy: Date.now(),
    };
    setDeploys((prev) => [deploy, ...prev]);
    setNewName("");
    setShowForm(false);
  };

  const redeploy = (id: string) => {
    setDeploys((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "building" as const, lastDeploy: Date.now() } : d))
    );
    setTimeout(() => {
      setDeploys((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "ready" as const } : d))
      );
    }, 3000);
  };

  const vercelProjects = deploys.filter((d) => d.platform === "vercel");
  const netlifyProjects = deploys.filter((d) => d.platform === "netlify");

  const renderDeploySection = (title: string, projects: DeployProject[], icon: React.ComponentType<React.SVGProps<SVGSVGElement>>) => {
    const Icon = icon;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-text-muted" />
          <h3 className="text-text text-sm font-medium">{title}</h3>
          <Badge variant="secondary" className="text-[10px] bg-surface-elevated text-text-dim border-border">
            {projects.length}
          </Badge>
        </div>
        {projects.length === 0 ? (
          <p className="text-text-dim text-xs pl-6">No projects deployed</p>
        ) : (
          <div className="space-y-2 pl-6">
            {projects.map((deploy) => {
              const config = statusConfig(deploy.status);
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={deploy.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors group"
                >
                  <StatusIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      config.color,
                      deploy.status === "building" && "animate-spin"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-text text-sm font-medium truncate">
                        {deploy.name}
                      </span>
                      <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", config.badge)}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {deploy.url && (
                        <a
                          href={deploy.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-dim text-xs flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {deploy.url.replace(/^https?:\/\//, "").slice(0, 30)}
                        </a>
                      )}
                      <span className="text-text-dim text-xs">
                        {formatRelativeTime(new Date(deploy.lastDeploy))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => redeploy(deploy.id)}
                      className="h-7 px-2 text-text-dim hover:text-accent text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Redeploy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-text-dim hover:text-accent text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Logs
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-lg font-semibold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Deployments
          </h2>
          <p className="text-text-muted text-sm mt-0.5">Manage and monitor your deployments</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-accent text-background hover:bg-accent/90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
          {!showForm && "New Deploy"}
        </Button>
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
                <form onSubmit={addDeploy} className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Project name"
                      className="flex-1 bg-surface-elevated border-border text-text placeholder:text-text-dim"
                    />
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={newPlatform === "vercel" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPlatform("vercel")}
                        className={cn(
                          newPlatform === "vercel"
                            ? "bg-accent text-background"
                            : "border-border text-text-muted"
                        )}
                      >
                        Vercel
                      </Button>
                      <Button
                        type="button"
                        variant={newPlatform === "netlify" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPlatform("netlify")}
                        className={cn(
                          newPlatform === "netlify"
                            ? "bg-accent text-background"
                            : "border-border text-text-muted"
                        )}
                      >
                        Netlify
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-accent text-background hover:bg-accent/90"
                  >
                    Add Deploy
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-text-muted flex items-center gap-2">
            <Cloud className="h-4 w-4 text-accent" />
            Connected Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {integrations.map((integ) => (
              <Badge
                key={integ.id}
                variant="secondary"
                className={cn(
                  "text-xs",
                  integ.connected
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-surface-elevated text-text-dim border-border"
                )}
              >
                {integ.connected ? (
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {integ.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {renderDeploySection("Vercel Projects", vercelProjects, Cloud)}
        <Separator className="bg-border" />
        {renderDeploySection("Netlify Sites", netlifyProjects, Globe)}
      </div>
    </div>
  );
}
