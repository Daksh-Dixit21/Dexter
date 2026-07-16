"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  BellOff,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Droplets,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Loader2,
  MessageCircle,
  Moon,
  Palette,
  RotateCcw,
  Shield,
  Sparkles,
  Sun,
  User,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AppDock } from "@/components/layout/AppDock";
import { PageLayout } from "@/components/layout/PageLayout";
import { MascotBubble } from "@/components/mascot/MascotBubble";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitHubIcon } from "@/components/ui/github-icon";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MOOD_COLORS, type Mood } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOOD_LABELS: Record<Mood, string> = {
  idle: "Idle",
  happy: "Happy",
  affection: "Love",
  success: "Success",
  thinking: "Thinking",
  confused: "Confused",
  concerned: "Concerned",
  sleeping: "Sleeping",
};

const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  idle: "Default standby mode when your workspace is calm.",
  happy: "Positive encouragement after momentum or lightweight wins.",
  affection: "Warm, friendly personality moments and greeting energy.",
  success: "Triggered after completed tasks, deploy wins, or shipped work.",
  thinking: "Appears when there are several active tasks or focus pressure.",
  confused: "Warns about overdue todos or things needing attention.",
  concerned: "Used for upcoming renewals, alerts, or risk signals.",
  sleeping: "Quiet mode for low activity and reduced interruption moments.",
};

type TestState = "idle" | "loading" | "ok" | "error";

interface BotLog {
  id: string;
  type: "speech" | "nudge";
  mood: Mood;
  message: string;
  createdAt: number;
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  tokenKey,
  placeholder,
  testEndpoint,
  testAction,
  testHeader,
  color = "text-accent",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  tokenKey: string;
  placeholder: string;
  testEndpoint: string;
  testAction: string;
  testHeader: string;
  color?: string;
  children?: React.ReactNode;
}) {
  const [token, setToken] = useLocalStorage(tokenKey, "");
  const [show, setShow] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");
  const [testMsg, setTestMsg] = useState("");

  const test = async () => {
    if (!token) return;
    setTestState("loading");
    setTestMsg("");
    try {
      const method =
        testAction === "ping" && testEndpoint.includes("telegram")
          ? "POST"
          : "GET";
      const opts: RequestInit = {
        method,
        headers: { [testHeader]: token, "Content-Type": "application/json" },
      };
      if (method === "POST") {
        opts.body = JSON.stringify({ action: "ping", botToken: token });
      }
      const url =
        method === "GET"
          ? `${testEndpoint}?action=${testAction}`
          : testEndpoint;
      const res = await fetch(url, opts);
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Connection failed");
      const info =
        data.username || data.login || data.email || data.name || "Connected!";
      setTestMsg(`✓ ${info}`);
      setTestState("ok");
    } catch (e: any) {
      setTestMsg(e.message || "Failed");
      setTestState("error");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-text">{title}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
        {testState === "ok" && (
          <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
            <Check className="h-3 w-3" /> Connected
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={show ? "text" : "password"}
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setTestState("idle");
            }}
            placeholder={placeholder}
            className="pr-9 bg-surface-elevated border-border text-text placeholder:text-text-dim font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-dim hover:text-text"
          >
            {show ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={test}
          disabled={!token || testState === "loading"}
          className="border-border text-text-muted hover:text-text shrink-0"
        >
          {testState === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Test"
          )}
        </Button>
      </div>
      {testMsg && (
        <p
          className={`text-xs flex items-center gap-1 ${testState === "ok" ? "text-green-400" : "text-red-400"}`}
        >
          {testState === "error" && <AlertCircle className="h-3 w-3" />}{" "}
          {testMsg}
        </p>
      )}
      {children}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  storageKey,
  defaultValue = true,
  color = "text-accent",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  storageKey: string;
  defaultValue?: boolean;
  color?: string;
}) {
  const [value, setValue] = useLocalStorage(storageKey, defaultValue);
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon className={`h-4 w-4 ${color}`} />
        <div>
          <p className="text-sm text-text">{label}</p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <button
        onClick={() => setValue(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${value ? "bg-accent" : "bg-surface-elevated border border-border"}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${value ? "left-5.5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useLocalStorage("dexter.userName", "Builder");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">(
    "dexter.theme",
    "dark",
  );
  const [mascotSize, setMascotSize] = useLocalStorage<"sm" | "md" | "lg">(
    "dexter.mascotSize",
    "md",
  );
  const [previewMood, setPreviewMood] = useState<Mood>("idle");
  const [petCount, setPetCount] = useLocalStorage("dexter.petCount", 0);
  const [botLogs, setBotLogs] = useLocalStorage<BotLog[]>("dexter.botLogs", []);
  const [telegramChatId, setTelegramChatId] = useLocalStorage(
    "dexter.telegramChatId",
    "",
  );
  const [activeSection, setActiveSection] = useState<string | null>(
    "integrations",
  );
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushState, setPushState] = useState<
    "idle" | "loading" | "ok" | "denied"
  >("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section) setActiveSection(section);
  }, [searchParams]);
  useEffect(() => {
    if (mounted)
      document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted && "Notification" in window) {
      if (Notification.permission === "granted") setPushEnabled(true);
    }
  }, [mounted]);

  const requestPush = async () => {
    if (!("Notification" in window)) return;
    setPushState("loading");
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPushEnabled(true);
      setPushState("ok");
    } else {
      setPushState("denied");
    }
  };

  const resetAll = () => {
    if (
      !confirm(
        "Reset ALL Dexter data? This clears all tokens, settings, and local state.",
      )
    )
      return;
    localStorage.clear();
    window.location.reload();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading settings...</p>
      </div>
    );
  }

  const SECTIONS = [
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "profile", label: "Profile", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "companion", label: "Companion", icon: Bot },
    { id: "danger", label: "Danger Zone", icon: Shield },
  ];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto pb-28">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors text-text-muted hover:text-text shrink-0"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">Settings</h1>
            <p className="text-sm text-text-muted mt-1">
              Configure your Dexter workspace
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-6">
          {/* Sidebar nav */}
          <div className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() =>
                    setActiveSection(s.id === activeSection ? null : s.id)
                  }
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                    activeSection === s.id
                      ? "bg-accent text-white"
                      : "text-text-muted hover:text-text hover:bg-surface-elevated",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                  {activeSection !== s.id && (
                    <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {/* ─── Integrations ─── */}
              {activeSection === "integrations" && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      <h2 className="font-semibold text-text">
                        API Integrations
                      </h2>
                    </div>
                    <p className="text-xs text-amber-400 flex items-center gap-1.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Shield className="h-3.5 w-3.5 shrink-0" />
                      Tokens are stored locally in your browser. Never shared.
                      Use scoped tokens for best security.
                    </p>

                    <IntegrationCard
                      icon={GitHubIcon}
                      title="GitHub"
                      description="PAT with repo, workflow scopes"
                      tokenKey="dexter.githubToken"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      testEndpoint="/api/github"
                      testAction="ping"
                      testHeader="x-github-token"
                      color="text-white"
                    />
                    <Separator />
                    <IntegrationCard
                      icon={Globe}
                      title="Vercel"
                      description="Personal access token from Vercel dashboard"
                      tokenKey="dexter.vercelToken"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                      testEndpoint="/api/vercel"
                      testAction="ping"
                      testHeader="x-vercel-token"
                      color="text-white"
                    />
                    <Separator />
                    <IntegrationCard
                      icon={Globe}
                      title="Netlify"
                      description="Personal access token from Netlify user settings"
                      tokenKey="dexter.netlifyToken"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                      testEndpoint="/api/netlify"
                      testAction="ping"
                      testHeader="x-netlify-token"
                      color="text-teal-400"
                    />
                    <Separator />
                    <IntegrationCard
                      icon={MessageCircle}
                      title="Telegram Bot"
                      description="Token from @BotFather · create a bot and paste token here"
                      tokenKey="dexter.telegramToken"
                      placeholder="1234567890:ABCDEFxxxxxxxxxxxx"
                      testEndpoint="/api/telegram"
                      testAction="ping"
                      testHeader="x-telegram-token"
                      color="text-blue-400"
                    >
                      <div className="space-y-1.5 mt-2">
                        <label className="text-xs text-text-muted">
                          Your Telegram Chat ID
                        </label>
                        <Input
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="123456789  (send /start to your bot to get it)"
                          className="bg-surface-elevated border-border text-text placeholder:text-text-dim text-sm"
                        />
                        <p className="text-[10px] text-text-dim">
                          1. Message your bot on Telegram 2. Send /start 3.
                          Visit: api.telegram.org/bot{`{TOKEN}`}/getUpdates
                        </p>
                      </div>
                    </IntegrationCard>
                  </Card>
                </motion.div>
              )}

              {/* ─── Profile ─── */}
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      <h2 className="font-semibold text-text">Profile</h2>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted font-medium">
                        Your Name
                      </label>
                      <Input
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Your name"
                        className="bg-surface-elevated border-border text-text"
                      />
                      <p className="text-xs text-text-dim">
                        Used for greetings and personalization.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Appearance ─── */}
              {activeSection === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-accent" />
                      <h2 className="font-semibold text-text">Appearance</h2>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-text-muted font-medium">
                        Theme
                      </label>
                      <div className="flex gap-2">
                        {(["light", "dark"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-all",
                              theme === t
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-text-muted hover:border-accent/30",
                            )}
                          >
                            {t === "light" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                      <label className="text-xs text-text-muted font-medium">
                        Mascot Size
                      </label>
                      <div className="flex gap-2">
                        {(["sm", "md", "lg"] as const).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setMascotSize(sz)}
                            className={cn(
                              "flex-1 py-2 rounded-lg border text-sm transition-all",
                              mascotSize === sz
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-text-muted",
                            )}
                          >
                            {sz.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Separator />
                    <div className="space-y-3">
                      <label className="text-xs text-text-muted font-medium">
                        Mood Preview
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(MOOD_COLORS) as Mood[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setPreviewMood(m)}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full border transition-all",
                              previewMood === m
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-text-muted hover:border-accent/30",
                            )}
                          >
                            {MOOD_LABELS[m]}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-center py-6">
                        <MascotBubble mood={previewMood} size={mascotSize} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Notifications ─── */}
              {activeSection === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-accent" />
                      <h2 className="font-semibold text-text">Notifications</h2>
                    </div>

                    {/* Browser push */}
                    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surface-elevated/50">
                      <div className="flex items-center gap-2.5">
                        <Bell className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-sm text-text">
                            Browser Push Notifications
                          </p>
                          <p className="text-xs text-text-muted">
                            Opt-in for nudges and reminders
                          </p>
                        </div>
                      </div>
                      {pushEnabled ? (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> On
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={requestPush}
                          disabled={
                            pushState === "loading" || pushState === "denied"
                          }
                          className="border-border text-text-muted hover:text-text text-xs h-7"
                        >
                          {pushState === "loading" ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : null}
                          {pushState === "denied"
                            ? "Denied in browser"
                            : "Enable"}
                        </Button>
                      )}
                    </div>

                    <Separator />
                    <div className="space-y-4">
                      <ToggleRow
                        icon={Droplets}
                        label="Water Reminders"
                        description="Nudge every 2 hours while app is open"
                        storageKey="dexter.waterReminder"
                        color="text-blue-400"
                      />
                      <ToggleRow
                        icon={Brain}
                        label="Focus Nudges"
                        description="Gentle reminders to take breaks"
                        storageKey="dexter.focusNudge"
                        color="text-yellow-400"
                      />
                      <ToggleRow
                        icon={Zap}
                        label="Deploy Alerts"
                        description="Notify when deploys complete"
                        storageKey="dexter.deployAlerts"
                        color="text-green-400"
                      />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Companion ─── */}
              {activeSection === "companion" && (
                <motion.div
                  key="companion"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-accent" />
                      <h2 className="font-semibold text-text">
                        Dexter Companion
                      </h2>
                    </div>
                    <div className="flex items-center justify-center py-4">
                      <MascotBubble
                        mood={previewMood}
                        size="lg"
                        onClick={() => {}}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-text-muted">
                      <span>Total pets: {petCount}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPetCount(0)}
                        className="gap-1 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" /> Reset
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-text-muted">
                        Mood buttons are preview-only. In the dashboard, Dexter picks moods automatically from tasks, reminders, subscriptions, and activity.
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(Object.keys(MOOD_COLORS) as Mood[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setPreviewMood(m)}
                            className={cn(
                              "text-left rounded-lg border p-3 transition-all",
                              previewMood === m
                                ? "border-accent bg-accent/10"
                                : "border-border bg-surface-elevated/40 hover:border-accent/30",
                            )}
                          >
                            <span className="text-xs font-medium text-text">
                              {MOOD_LABELS[m]}
                            </span>
                            <span className="mt-1 block text-[11px] leading-relaxed text-text-muted">
                              {MOOD_DESCRIPTIONS[m]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3 rounded-xl border border-border bg-surface-elevated/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-text">Bot Logs</p>
                          <p className="text-xs text-text-muted">
                            Recent companion speech and nudge history stored locally.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBotLogs([])}
                          disabled={botLogs.length === 0}
                          className="border-border text-xs text-text-muted hover:text-text"
                        >
                          Clear Logs
                        </Button>
                      </div>
                      {botLogs.length === 0 ? (
                        <p className="text-xs text-text-dim">No bot logs yet.</p>
                      ) : (
                        <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                          {botLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="rounded-lg border border-border/70 bg-background/60 p-2">
                              <div className="mb-1 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-text-dim">
                                <span>{log.type} / {MOOD_LABELS[log.mood]}</span>
                                <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="line-clamp-2 text-xs text-text-muted">{log.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <ToggleRow
                      icon={Sparkles}
                      label="Personality Bubbles"
                      description="Show speech bubbles from Dexter"
                      storageKey="dexter.speechBubbles"
                      color="text-accent"
                    />
                  </Card>
                </motion.div>
              )}

              {/* ─── Danger Zone ─── */}
              {activeSection === "danger" && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Card className="p-6 space-y-4 border-red-500/20">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-400" />
                      <h2 className="font-semibold text-text">Danger Zone</h2>
                    </div>
                    <p className="text-xs text-text-muted">
                      These actions are irreversible. Resetting will clear all
                      local tokens, settings, and state.
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetAll}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset All Data
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AppDock activeView="settings" onNavigate={(view) => router.push(`/?tab=${view}`)} />
    </PageLayout>
  );
}

