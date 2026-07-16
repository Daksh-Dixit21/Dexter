"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Rocket,
  Settings,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn, formatRelativeTime } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  link?: {
    repoId?: number;
    repo?: string;
    repoOwnerId?: number;
    gitCredentialId?: string;
  };
  latestDeployments?: VercelDeployment[];
  targets?: { production?: VercelDeployment };
}

interface VercelDeployment {
  uid: string;
  url: string;
  state:
    | "READY"
    | "ERROR"
    | "BUILDING"
    | "INITIALIZING"
    | "QUEUED"
    | "CANCELED";
  created: number;
  createdAt?: number;
  meta?: { githubCommitMessage?: string };
}

interface NetlifySite {
  id: string;
  name: string;
  url: string;
  ssl_url: string;
  custom_domain: string | null;
  build_settings?: { repo_path?: string };
  repo_url?: string;
  published_deploy?: {
    id: string;
    state: string;
    created_at: string;
    deploy_url: string;
    title?: string;
  };
}

type Platform = "vercel" | "netlify";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function vercelStateConfig(state: string) {
  switch (state) {
    case "READY":
      return {
        icon: CheckCircle2,
        color: "text-green-400",
        badge: "bg-green-500/15 text-green-400 border-green-500/30",
        label: "Ready",
      };
    case "BUILDING":
    case "INITIALIZING":
    case "QUEUED":
      return {
        icon: Loader2,
        color: "text-yellow-400 animate-spin",
        badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        label: "Building",
      };
    case "ERROR":
    case "CANCELED":
      return {
        icon: AlertCircle,
        color: "text-red-400",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        label: "Error",
      };
    default:
      return {
        icon: Cloud,
        color: "text-text-dim",
        badge: "bg-surface-elevated text-text-dim border-border",
        label: state,
      };
  }
}

function netlifyStateConfig(state: string) {
  if (state === "ready")
    return {
      icon: CheckCircle2,
      color: "text-green-400",
      badge: "bg-green-500/15 text-green-400 border-green-500/30",
      label: "Ready",
    };
  if (state === "building" || state === "processing")
    return {
      icon: Loader2,
      color: "text-yellow-400 animate-spin",
      badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
      label: "Building",
    };
  if (state === "error")
    return {
      icon: AlertCircle,
      color: "text-red-400",
      badge: "bg-red-500/15 text-red-400 border-red-500/30",
      label: "Error",
    };
  return {
    icon: Cloud,
    color: "text-text-dim",
    badge: "bg-surface-elevated text-text-dim border-border",
    label: state,
  };
}

// ─── Connect Repo Modal ───────────────────────────────────────────────────────

function ConnectRepoModal({
  platform,
  vercelToken,
  netlifyToken,
  githubToken,
  onClose,
  onSuccess,
}: {
  platform: Platform;
  vercelToken: string;
  netlifyToken: string;
  githubToken: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [repoFullName, setRepoFullName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [branch, setBranch] = useState("main");
  const [buildCmd, setBuildCmd] = useState(
    platform === "vercel" ? "" : "npm run build",
  );
  const [publishDir, setPublishDir] = useState(
    platform === "vercel" ? "" : "out",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repos, setRepos] = useState<{ full_name: string; name: string }[]>([]);
  const [repoSearch, setRepoSearch] = useState("");

  useEffect(() => {
    if (!githubToken) return;
    fetch("/api/github?action=list", {
      headers: { "x-github-token": githubToken },
    })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setRepos(d))
      .catch(() => {});
  }, [githubToken]);

  const filteredRepos = repos.filter((r) =>
    r.full_name.toLowerCase().includes(repoSearch.toLowerCase()),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoFullName || !projectName) return;
    setLoading(true);
    setError(null);

    try {
      if (platform === "vercel") {
        const res = await fetch("/api/vercel", {
          method: "POST",
          headers: {
            "x-vercel-token": vercelToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create",
            name: projectName,
            repoFullName,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to create Vercel project");
      } else {
        const res = await fetch("/api/netlify", {
          method: "POST",
          headers: {
            "x-netlify-token": netlifyToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "create",
            name: projectName,
            repoFullName,
            branch,
            buildCommand: buildCmd,
            publishDir,
          }),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to create Netlify site");
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {platform === "vercel" ? (
              <Cloud className="h-5 w-5 text-black dark:text-white" />
            ) : (
              <Globe className="h-5 w-5 text-teal-400" />
            )}
            <h2 className="font-semibold text-text">
              Deploy to {platform === "vercel" ? "Vercel" : "Netlify"}
            </h2>
          </div>
          <button onClick={onClose} className="text-text-dim hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Repo picker */}
          <div className="space-y-2">
            <label className="text-xs text-text-muted font-medium">
              GitHub Repository
            </label>
            <div className="space-y-2">
              <Input
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                placeholder="Search your repos..."
                className="bg-surface-elevated border-border text-text placeholder:text-text-dim text-sm"
              />
              {filteredRepos.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-surface-elevated">
                  {filteredRepos.slice(0, 10).map((r) => (
                    <button
                      key={r.full_name}
                      type="button"
                      onClick={() => {
                        setRepoFullName(r.full_name);
                        setProjectName(r.name);
                        setRepoSearch(r.full_name);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-accent/10 transition-colors flex items-center gap-2",
                        repoFullName === r.full_name &&
                          "bg-accent/10 text-accent",
                      )}
                    >
                      <GitBranch className="h-3 w-3 shrink-0 text-text-dim" />
                      {r.full_name}
                    </button>
                  ))}
                </div>
              )}
              {!githubToken && (
                <p className="text-xs text-amber-400">
                  Connect GitHub in Settings to pick from your repos
                </p>
              )}
              {!repoFullName && (
                <Input
                  value={repoFullName}
                  onChange={(e) => setRepoFullName(e.target.value)}
                  placeholder="Or type: username/repo-name"
                  className="bg-surface-elevated border-border text-text placeholder:text-text-dim text-sm font-mono"
                />
              )}
            </div>
          </div>

          {/* Project name */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-medium">
              Project Name
            </label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-project"
              className="bg-surface-elevated border-border text-text placeholder:text-text-dim font-mono text-sm"
              required
            />
          </div>

          {/* Netlify-specific settings */}
          {platform === "netlify" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium">
                  Branch
                </label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="bg-surface-elevated border-border text-text text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-medium">
                  Publish Dir
                </label>
                <Input
                  value={publishDir}
                  onChange={(e) => setPublishDir(e.target.value)}
                  placeholder="out"
                  className="bg-surface-elevated border-border text-text text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs text-text-muted font-medium">
                  Build Command
                </label>
                <Input
                  value={buildCmd}
                  onChange={(e) => setBuildCmd(e.target.value)}
                  placeholder="npm run build"
                  className="bg-surface-elevated border-border text-text text-sm font-mono"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !projectName || !repoFullName}
            className="w-full bg-accent text-white hover:bg-accent/90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            {loading
              ? "Deploying..."
              : `Deploy to ${platform === "vercel" ? "Vercel" : "Netlify"}`}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main DeployView ──────────────────────────────────────────────────────────

export default function DeployView({
  initialRepo,
}: {
  initialRepo?: { full_name: string; name: string } | null;
}) {
  const [vercelToken] = useLocalStorage("dexter.vercelToken", "");
  const [netlifyToken] = useLocalStorage("dexter.netlifyToken", "");
  const [githubToken] = useLocalStorage("dexter.githubToken", "");

  const [vercelProjects, setVercelProjects] = useState<VercelProject[]>([]);
  const [netlifySites, setNetlifySites] = useState<NetlifySite[]>([]);
  const [loadingVercel, setLoadingVercel] = useState(false);
  const [loadingNetlify, setLoadingNetlify] = useState(false);
  const [errorVercel, setErrorVercel] = useState<string | null>(null);
  const [errorNetlify, setErrorNetlify] = useState<string | null>(null);
  const [connectModal, setConnectModal] = useState<Platform | null>(null);
  const [redeploying, setRedeploying] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchVercel = useCallback(async () => {
    if (!vercelToken) {
      setErrorVercel("Add Vercel token in Settings");
      return;
    }
    setLoadingVercel(true);
    setErrorVercel(null);
    try {
      const res = await fetch("/api/vercel?action=list", {
        headers: { "x-vercel-token": vercelToken },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Vercel error");
      setVercelProjects(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorVercel(e.message);
    } finally {
      setLoadingVercel(false);
    }
  }, [vercelToken]);

  const fetchNetlify = useCallback(async () => {
    if (!netlifyToken) {
      setErrorNetlify("Add Netlify token in Settings");
      return;
    }
    setLoadingNetlify(true);
    setErrorNetlify(null);
    try {
      const res = await fetch("/api/netlify?action=list", {
        headers: { "x-netlify-token": netlifyToken },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Netlify error");
      setNetlifySites(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErrorNetlify(e.message);
    } finally {
      setLoadingNetlify(false);
    }
  }, [netlifyToken]);

  useEffect(() => {
    fetchVercel();
    fetchNetlify();
  }, [fetchVercel, fetchNetlify]);

  // If a repo is passed in, open the connect modal immediately
  useEffect(() => {
    if (initialRepo) setConnectModal("vercel");
  }, [initialRepo]);

  const redeployVercel = async (p: VercelProject) => {
    if (!vercelToken) return;
    setRedeploying(p.id);
    try {
      await fetch("/api/vercel", {
        method: "POST",
        headers: {
          "x-vercel-token": vercelToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "redeploy",
          projectId: p.id,
          projectName: p.name,
        }),
      });
      setTimeout(fetchVercel, 3000);
    } catch {
    } finally {
      setTimeout(() => setRedeploying(null), 3000);
    }
  };

  const redeployNetlify = async (site: NetlifySite) => {
    if (!netlifyToken) return;
    setRedeploying(site.id);
    try {
      await fetch("/api/netlify", {
        method: "POST",
        headers: {
          "x-netlify-token": netlifyToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "redeploy", siteId: site.id }),
      });
      setTimeout(fetchNetlify, 3000);
    } catch {
    } finally {
      setTimeout(() => setRedeploying(null), 3000);
    }
  };

  const hasVercel = !!vercelToken;
  const hasNetlify = !!netlifyToken;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text text-lg font-semibold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-accent" />
            Deployments
          </h2>
          <p className="text-text-muted text-xs mt-0.5">
            {vercelProjects.length} Vercel · {netlifySites.length} Netlify
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchVercel();
              fetchNetlify();
            }}
            className="h-8 w-8 p-0 text-text-muted hover:text-text"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (loadingVercel || loadingNetlify) && "animate-spin",
              )}
            />
          </Button>
          <Button
            onClick={() => setConnectModal("vercel")}
            size="sm"
            className="bg-accent text-white hover:bg-accent/90 gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Deploy
          </Button>
        </div>
      </div>

      {/* Quick platform buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setConnectModal("vercel")}
          className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/30 bg-surface hover:bg-accent/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-black dark:bg-white/10 flex items-center justify-center">
            <Cloud className="h-4 w-4 text-white dark:text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">
              Vercel
            </p>
            <p className="text-xs text-text-dim">
              {hasVercel
                ? `${vercelProjects.length} projects`
                : "Not connected"}
            </p>
          </div>
          <Plus className="h-4 w-4 text-text-dim ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={() => setConnectModal("netlify")}
          className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-border hover:border-teal-400/30 bg-surface hover:bg-teal-400/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Globe className="h-4 w-4 text-teal-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text group-hover:text-teal-400 transition-colors">
              Netlify
            </p>
            <p className="text-xs text-text-dim">
              {hasNetlify ? `${netlifySites.length} sites` : "Not connected"}
            </p>
          </div>
          <Plus className="h-4 w-4 text-text-dim ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* ─── Vercel Section ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-text-muted" />
          <h3 className="text-sm font-medium text-text">Vercel Projects</h3>
          {loadingVercel && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-text-dim" />
          )}
          {!loadingVercel && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-surface-elevated text-text-dim border-border"
            >
              {vercelProjects.length}
            </Badge>
          )}
        </div>

        {errorVercel && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400">{errorVercel}</p>
            {!hasVercel && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-6 text-xs text-amber-400"
                onClick={() => (window.location.href = "/settings")}
              >
                Settings
              </Button>
            )}
          </div>
        )}

        {loadingVercel && vercelProjects.length === 0 && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-surface-elevated animate-pulse"
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {vercelProjects.map((p) => {
            const deploy = p.targets?.production;
            const state = deploy?.state || "READY";
            const cfg = vercelStateConfig(state);
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === `v-${p.id}`;

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="group hover:border-accent/20 transition-all">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : `v-${p.id}`)
                    }
                  >
                    <StatusIcon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text truncate font-mono">
                          {p.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px] px-1.5", cfg.badge)}
                        >
                          {cfg.label}
                        </Badge>
                        {p.framework && (
                          <span className="text-[10px] text-text-dim">
                            {p.framework}
                          </span>
                        )}
                      </div>
                      {deploy && (
                        <div className="flex items-center gap-3 mt-0.5 text-text-dim text-xs">
                          <a
                            href={`https://${deploy.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 hover:text-accent transition-colors truncate max-w-[200px]"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {deploy.url
                              ?.replace(/^https?:\/\//, "")
                              .slice(0, 35)}
                          </a>
                          {deploy.created && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(new Date(deploy.created))}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          redeployVercel(p);
                        }}
                        disabled={redeploying === p.id}
                        className="h-7 px-2 text-text-dim hover:text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {redeploying === p.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-text-dim" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-text-dim" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && deploy && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-3 space-y-2 bg-surface-elevated/50">
                          {deploy.meta?.githubCommitMessage && (
                            <p className="text-xs text-text-muted italic">
                              "{deploy.meta.githubCommitMessage}"
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <a
                              href={`https://${deploy.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" /> Visit site
                            </a>
                            <a
                              href={`https://vercel.com/dashboard`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-text-dim hover:text-text flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" /> Dashboard
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ─── Netlify Section ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-teal-400" />
          <h3 className="text-sm font-medium text-text">Netlify Sites</h3>
          {loadingNetlify && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-text-dim" />
          )}
          {!loadingNetlify && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-surface-elevated text-text-dim border-border"
            >
              {netlifySites.length}
            </Badge>
          )}
        </div>

        {errorNetlify && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400">{errorNetlify}</p>
            {!hasNetlify && (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto h-6 text-xs text-amber-400"
                onClick={() => (window.location.href = "/settings")}
              >
                Settings
              </Button>
            )}
          </div>
        )}

        {loadingNetlify && netlifySites.length === 0 && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-surface-elevated animate-pulse"
              />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {netlifySites.map((site) => {
            const deploy = site.published_deploy;
            const cfg = deploy
              ? netlifyStateConfig(deploy.state)
              : netlifyStateConfig("ready");
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === `n-${site.id}`;

            return (
              <motion.div
                key={site.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="group hover:border-teal-400/20 transition-all">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : `n-${site.id}`)
                    }
                  >
                    <StatusIcon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text truncate font-mono">
                          {site.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px] px-1.5", cfg.badge)}
                        >
                          {cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-text-dim text-xs">
                        <a
                          href={site.ssl_url || site.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-teal-400 transition-colors truncate max-w-[200px]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {(site.ssl_url || site.url)
                            ?.replace(/^https?:\/\//, "")
                            .slice(0, 35)}
                        </a>
                        {deploy?.created_at && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(new Date(deploy.created_at))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          redeployNetlify(site);
                        }}
                        disabled={redeploying === site.id}
                        className="h-7 px-2 text-text-dim hover:text-teal-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {redeploying === site.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-text-dim" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-text-dim" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-3 space-y-2 bg-surface-elevated/50">
                          {site.custom_domain && (
                            <p className="text-xs text-text-muted flex items-center gap-1">
                              <Link2 className="h-3 w-3" /> {site.custom_domain}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <a
                              href={site.ssl_url || site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" /> Visit site
                            </a>
                            <a
                              href="https://app.netlify.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-text-dim hover:text-text flex items-center gap-1"
                            >
                              <FileText className="h-3 w-3" /> Dashboard
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Connect Repo Modal */}
      <AnimatePresence>
        {connectModal && (
          <ConnectRepoModal
            platform={connectModal}
            vercelToken={vercelToken}
            netlifyToken={netlifyToken}
            githubToken={githubToken}
            onClose={() => setConnectModal(null)}
            onSuccess={() => {
              fetchVercel();
              fetchNetlify();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
