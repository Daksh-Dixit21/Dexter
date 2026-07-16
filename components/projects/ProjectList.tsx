"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  FolderGit2,
  GitBranch,
  Globe,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Star,
  StarOff,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatRepoSize, isStale } from "@/lib/github/client";
import { cn, formatRelativeTime } from "@/lib/utils";

interface GHRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  pushed_at: string | null;
  updated_at: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  size: number;
  default_branch: string;
  topics?: string[];
  open_issues_count: number;
}

type FilterMode = "all" | "public" | "private" | "stale" | "starred";
type SortMode = "updated" | "name" | "stars";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
  Swift: "#FA7343",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

export default function ProjectList({
  onConnectDeploy,
}: {
  onConnectDeploy?: (repo: GHRepo) => void;
}) {
  const [githubToken] = useLocalStorage("dexter.githubToken", "");
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sort, setSort] = useState<SortMode>("updated");
  const [starred, setStarred] = useLocalStorage<number[]>(
    "dexter.starredRepos",
    [],
  );
  const [pinnedIds, setPinnedIds] = useLocalStorage<number[]>(
    "dexter.pinnedRepos",
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrivate, setNewPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchRepos = useCallback(async () => {
    if (!githubToken) {
      setError("Add your GitHub PAT in Settings to see your repos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/github?action=list", {
        headers: { "x-github-token": githubToken },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "GitHub API error");
      }
      const data: GHRepo[] = await res.json();
      setRepos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [githubToken]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const filteredRepos = repos
    .filter((r) => {
      const q = debouncedSearch.toLowerCase();
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !r.description?.toLowerCase().includes(q)
      )
        return false;
      if (filter === "public") return !r.private;
      if (filter === "private") return r.private;
      if (filter === "stale") return isStale(r.pushed_at);
      if (filter === "starred") return starred.includes(r.id);
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "stars") return b.stargazers_count - a.stargazers_count;
      return (
        new Date(b.updated_at || 0).getTime() -
        new Date(a.updated_at || 0).getTime()
      );
    });

  // Pinned repos go first
  const pinned = filteredRepos.filter((r) => pinnedIds.includes(r.id));
  const unpinned = filteredRepos.filter((r) => !pinnedIds.includes(r.id));
  const sorted = [...pinned, ...unpinned];

  const togglePin = (id: number) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
    );
  };

  const toggleStar = async (repo: GHRepo) => {
    const isStar = !starred.includes(repo.id);
    setStarred((prev) =>
      isStar ? [...prev, repo.id] : prev.filter((x) => x !== repo.id),
    );
    if (!githubToken) return;
    const [owner, name] = repo.full_name.split("/");
    await fetch("/api/github", {
      method: "POST",
      headers: {
        "x-github-token": githubToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: isStar ? "star" : "unstar",
        owner,
        repo: name,
      }),
    }).catch(() => {});
  };

  const createRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !githubToken) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/github", {
        method: "POST",
        headers: {
          "x-github-token": githubToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          name: newName.trim(),
          description: newDesc,
          private: newPrivate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create repo");
      setRepos((prev) => [data as GHRepo, ...prev]);
      setNewName("");
      setNewDesc("");
      setNewPrivate(false);
      setShowForm(false);
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const FILTERS: { key: FilterMode; label: string }[] = [
    { key: "all", label: "All" },
    { key: "public", label: "Public" },
    { key: "private", label: "Private" },
    { key: "stale", label: "Stale" },
    { key: "starred", label: "Starred" },
  ];

  if (!githubToken) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-text font-medium">GitHub not connected</p>
          <p className="text-sm text-text-muted">
            Add your GitHub Personal Access Token in Settings to manage
            repositories.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-accent text-white hover:bg-accent/90"
          onClick={() => (window.location.href = "/settings")}
        >
          Go to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-text text-lg font-semibold flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-accent" />
            Repositories
            {!loading && (
              <Badge
                variant="secondary"
                className="bg-accent/10 text-accent border-accent/20 text-xs"
              >
                {repos.length}
              </Badge>
            )}
          </h2>
          <p className="text-text-muted text-xs mt-0.5">
            {pinned.length > 0 && `${pinned.length} pinned · `}
            {filteredRepos.filter((r) => isStale(r.pushed_at)).length} stale
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRepos}
            disabled={loading}
            className="h-8 w-8 p-0 text-text-muted hover:text-text"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-accent text-white hover:bg-accent/90 gap-1.5"
          >
            {showForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {showForm ? "Cancel" : "New Repo"}
          </Button>
        </div>
      </div>

      {/* Create Repo Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-5">
                <form onSubmit={createRepo} className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-text">
                      Create New Repository
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="repository-name"
                      className="bg-surface-elevated border-border text-text placeholder:text-text-dim font-mono text-sm"
                      required
                    />
                    <Input
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="bg-surface-elevated border-border text-text placeholder:text-text-dim text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!newPrivate ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPrivate(false)}
                        className={cn(
                          "gap-1.5 text-xs h-8",
                          !newPrivate
                            ? "bg-accent text-white"
                            : "border-border text-text-muted",
                        )}
                      >
                        <Globe className="h-3 w-3" /> Public
                      </Button>
                      <Button
                        type="button"
                        variant={newPrivate ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewPrivate(true)}
                        className={cn(
                          "gap-1.5 text-xs h-8",
                          newPrivate
                            ? "bg-accent text-white"
                            : "border-border text-text-muted",
                        )}
                      >
                        <Lock className="h-3 w-3" /> Private
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={creating || !newName.trim()}
                      className="bg-accent text-white hover:bg-accent/90 ml-auto h-8 px-4 text-xs"
                    >
                      {creating ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {creating ? "Creating..." : "Create Repository"}
                    </Button>
                  </div>
                  {createError && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {createError}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="pl-9 bg-surface-elevated border-border text-text placeholder:text-text-dim"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "text-xs h-7 px-3 rounded-full",
                  filter === f.key
                    ? "bg-accent text-white"
                    : "text-text-muted hover:text-text hover:bg-surface-elevated",
                )}
              >
                {f.key === "stale" && "⚠️ "}
                {f.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-text-dim" />
            {(["updated", "name", "stars"] as SortMode[]).map((s) => (
              <Button
                key={s}
                variant="ghost"
                size="sm"
                onClick={() => setSort(s)}
                className={cn(
                  "text-xs h-6 px-2 capitalize",
                  sort === s ? "text-accent" : "text-text-dim",
                )}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchRepos}
            className="ml-auto h-6 px-2 text-xs text-red-400"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && repos.length === 0 && (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-surface-elevated animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Repo Grid */}
      {!loading && sorted.length === 0 && !error && (
        <div className="text-center py-12 text-text-dim text-sm">
          {debouncedSearch
            ? `No repos matching "${debouncedSearch}"`
            : "No repositories found."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((repo, idx) => {
            const stale = isStale(repo.pushed_at);
            const isPinned = pinnedIds.includes(repo.id);
            const isStarred = starred.includes(repo.id);
            const langColor = repo.language
              ? LANG_COLORS[repo.language] || "#6366f1"
              : "#6b7280";

            return (
              <motion.div
                key={repo.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
              >
                <Card
                  className={cn(
                    "group transition-all duration-200 hover:border-accent/30 hover:shadow-sm hover:shadow-accent/5",
                    isPinned && "border-accent/20 bg-accent/3",
                    stale && "border-amber-500/20",
                  )}
                >
                  <div className="flex items-start gap-3 p-4">
                    {/* Left color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: langColor }}
                    />

                    {/* Main info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-text hover:text-accent transition-colors font-mono"
                        >
                          {repo.name}
                        </a>
                        {repo.private && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 bg-surface-elevated text-text-dim border-border gap-1"
                          >
                            <Lock className="h-2.5 w-2.5" /> Private
                          </Badge>
                        )}
                        {stale && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 bg-amber-500/15 text-amber-400 border-amber-500/30 gap-1"
                          >
                            <Clock className="h-2.5 w-2.5" /> Stale
                          </Badge>
                        )}
                        {isPinned && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 bg-accent/15 text-accent border-accent/30"
                          >
                            📌 Pinned
                          </Badge>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-xs text-text-muted truncate">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-text-dim text-xs">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: langColor }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {repo.stargazers_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" /> {repo.forks_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {repo.pushed_at
                            ? formatRelativeTime(new Date(repo.pushed_at))
                            : "never"}
                        </span>
                        <span className="text-text-dim/60">
                          {formatRepoSize(repo.size)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => toggleStar(repo)}
                        title={isStarred ? "Unstar" : "Star"}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          isStarred
                            ? "text-yellow-400"
                            : "text-text-dim hover:text-yellow-400",
                        )}
                      >
                        {isStarred ? (
                          <Star className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <StarOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => togglePin(repo.id)}
                        title={isPinned ? "Unpin" : "Pin"}
                        className={cn(
                          "p-1.5 rounded-md transition-colors text-xs",
                          isPinned
                            ? "text-accent"
                            : "text-text-dim hover:text-accent",
                        )}
                      >
                        📌
                      </button>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md text-text-dim hover:text-text transition-colors"
                        title="Open on GitHub"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {onConnectDeploy && (
                        <button
                          onClick={() => onConnectDeploy(repo)}
                          title="Deploy this repo"
                          className="p-1.5 rounded-md text-text-dim hover:text-green-400 transition-colors"
                        >
                          <Rocket className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Topics */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="px-4 pb-3 flex gap-1.5 flex-wrap -mt-1">
                      {repo.topics.slice(0, 5).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated text-text-dim border border-border"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sorted.length > 0 && (
        <p className="text-center text-xs text-text-dim py-2">
          Showing {sorted.length} of {repos.length} repositories
        </p>
      )}
    </div>
  );
}
