"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  Plus,
  Repeat,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  message: string;
  time: string; // "HH:MM"
  repeat: "once" | "daily" | "weekdays";
  sentToday: boolean;
  createdAt: number;
  active: boolean;
}

const REPEAT_OPTIONS: { key: Reminder["repeat"]; label: string }[] = [
  { key: "once", label: "Once" },
  { key: "daily", label: "Daily" },
  { key: "weekdays", label: "Weekdays" },
];

export function TelegramReminder() {
  const [telegramToken] = useLocalStorage("dexter.telegramToken", "");
  const [telegramChatId] = useLocalStorage("dexter.telegramChatId", "");
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(
    "dexter.reminders",
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newRepeat, setNewRepeat] = useState<Reminder["repeat"]>("daily");
  const [sending, setSending] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<Record<string, "ok" | "error">>(
    {},
  );
  const [jsonMinimized, setJsonMinimized] = useState(true);

  const hasConfig = !!telegramToken && !!telegramChatId;
  const backgroundReminders = reminders
    .filter((rem) => rem.repeat !== "once")
    .map(({ message, time, repeat, active }) => ({
      message,
      time,
      repeat,
      active,
    }));
  const backgroundSecret = JSON.stringify(backgroundReminders, null, 2);

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const reminder: Reminder = {
      id: `rem-${Date.now()}`,
      message: newMsg.trim(),
      time: newTime,
      repeat: newRepeat,
      sentToday: false,
      createdAt: Date.now(),
      active: true,
    };
    setReminders((prev) => [reminder, ...prev]);
    setNewMsg("");
    setShowForm(false);
  };

  const sendNow = async (reminder: Reminder) => {
    if (!hasConfig) return;
    setSending(reminder.id);
    setSendResult((r) => ({ ...r, [reminder.id]: undefined as any }));
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          botToken: telegramToken,
          chatId: telegramChatId,
          text: `🔔 <b>Dexter Reminder</b>\n\n${reminder.message}\n\n<i>⏰ ${reminder.time} · ${reminder.repeat}</i>`,
        }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error);
      setSendResult((r) => ({ ...r, [reminder.id]: "ok" }));
      setReminders((prev) =>
        prev.map((rem) =>
          rem.id === reminder.id ? { ...rem, sentToday: true } : rem,
        ),
      );
    } catch {
      setSendResult((r) => ({ ...r, [reminder.id]: "error" }));
    } finally {
      setSending(null);
      setTimeout(
        () => setSendResult((r) => ({ ...r, [reminder.id]: undefined as any })),
        3000,
      );
    }
  };

  // Auto-send "once" reminders when their time arrives (while dashboard is open)
  const autoSendLockRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!hasConfig) return;

    const checkAndSend = async () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const rem of reminders) {
        if (rem.repeat !== "once" || rem.sentToday || rem.active === false) continue;
        if (autoSendLockRef.current.has(rem.id)) continue;

        const [h, m] = rem.time.split(":").map(Number);
        const reminderMinutes = h * 60 + m;
        const diff = currentMinutes - reminderMinutes;

        // Send if within 0-14 minutes of the scheduled time
        if (diff >= 0 && diff < 15) {
          autoSendLockRef.current.add(rem.id);
          setSending(rem.id);
          try {
            const res = await fetch("/api/telegram", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "send",
                botToken: telegramToken,
                chatId: telegramChatId,
                text: `🔔 <b>Dexter Reminder</b>\n\n${rem.message}\n\n<i>⏰ ${rem.time} · ${rem.repeat}</i>`,
              }),
            });
            const d = await res.json();
            if (res.ok && !d.error) {
              setSendResult((r) => ({ ...r, [rem.id]: "ok" }));
              setReminders((prev) =>
                prev.map((r) =>
                  r.id === rem.id ? { ...r, sentToday: true } : r,
                ),
              );
            }
          } catch {
            autoSendLockRef.current.delete(rem.id);
          } finally {
            setSending(null);
            setTimeout(
              () => setSendResult((r) => ({ ...r, [rem.id]: undefined as any })),
              3000,
            );
          }
        }
      }
    };

    checkAndSend();
    const interval = setInterval(checkAndSend, 60_000);
    return () => clearInterval(interval);
  }, [hasConfig, reminders, telegramToken, telegramChatId]);

  const toggleActive = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  };

  const deleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-text">
            Telegram Reminders
          </h2>
          {reminders.filter((r) => r.active).length > 0 && (
            <Badge
              variant="secondary"
              className="bg-blue-500/15 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]"
            >
              {reminders.filter((r) => r.active).length} active
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white hover:bg-blue-600 gap-1.5 h-8"
        >
          {showForm ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {showForm ? "Cancel" : "New"}
        </Button>
      </div>

      {!hasConfig && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Telegram not configured
            </p>
            <p className="text-xs text-text-dim mt-0.5">
              Add your Telegram Bot Token and Chat ID in Settings to enable
              manual sends. Background sends use GitHub Actions secrets.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-6 text-amber-600 dark:text-amber-400 ml-auto shrink-0"
            onClick={() => (window.location.href = "/settings")}
          >
            Settings →
          </Button>
        </div>
      )}

      {/* New reminder form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/5">
              <CardContent className="pt-4 space-y-3">
                <form onSubmit={addReminder} className="space-y-3">
                  <Input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Reminder message..."
                    className="bg-surface-elevated border-border text-text placeholder:text-text-dim"
                    required
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <Clock className="h-3.5 w-3.5 text-text-dim shrink-0" />
                      <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="bg-surface-elevated border border-border rounded-md px-2 py-1.5 text-text text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-1">
                      {REPEAT_OPTIONS.map((o) => (
                        <button
                          key={o.key}
                          type="button"
                          onClick={() => setNewRepeat(o.key)}
                          className={cn(
                            "text-xs px-2.5 py-1.5 rounded-lg border transition-all",
                            newRepeat === o.key
                              ? "border-blue-500/50 bg-blue-500/15 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
                              : "border-border text-text-muted",
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Bell className="h-3.5 w-3.5 mr-1.5" />
                    Save Reminder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


      {reminders.length > 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4 space-y-3">
            <button
              onClick={() => setJsonMinimized(!jsonMinimized)}
              className="flex items-center gap-2 w-full text-left"
            >
              {jsonMinimized ? (
                <ChevronRight className="h-3.5 w-3.5 text-text-dim" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-text-dim" />
              )}
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Background Telegram reminders
              </p>
            </button>
            {!jsonMinimized && (
              <>
                <p className="text-xs leading-relaxed text-text-muted pl-5">
                  To send reminders when Dexter is closed, add this JSON as a
                  GitHub Actions secret named <code className="text-text">DEXTER_TELEGRAM_REMINDERS</code>.
                  The workflow in <code className="text-text">.github/workflows/telegram-reminders.yml</code>
                  checks it every 15 minutes. One-time reminders stay manual.
                </p>
                <textarea
                  readOnly
                  value={backgroundSecret}
                  className="h-28 w-full resize-none rounded-lg border border-border bg-background p-2 font-mono text-[11px] text-text-muted outline-none"
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reminder list */}
      <div className="space-y-2">
        <AnimatePresence>
          {reminders.length === 0 && (
            <p className="text-center text-sm text-text-dim py-8">
              No reminders yet. Add one to get Telegram nudges! 🔔
            </p>
          )}
          {reminders.map((rem) => {
            const result = sendResult[rem.id];
            return (
              <motion.div
                key={rem.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card
                  className={cn(
                    "group transition-all",
                    !rem.active && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-3 p-3">
                    <button
                      onClick={() => toggleActive(rem.id)}
                      className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors",
                        rem.active
                          ? "border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-400"
                          : "border-border",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text">{rem.message}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-dim">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {rem.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" /> {rem.repeat}
                        </span>
                        {rem.sentToday && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-500/15 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                          >
                            Sent today
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {result === "ok" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      {result === "error" && (
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                      <button
                        onClick={() => sendNow(rem)}
                        disabled={!hasConfig || sending === rem.id}
                        title="Send now"
                        className="p-1.5 rounded-md text-text-dim hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-30"
                      >
                        {sending === rem.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteReminder(rem.id)}
                        className="p-1.5 rounded-md text-text-dim hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
