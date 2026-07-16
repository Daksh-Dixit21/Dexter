"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function ReminderList() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>(
    "dexter.simpleReminders",
    [],
  );
  const [newReminder, setNewReminder] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      if ((event as CustomEvent<{ action: string }>).detail.action === "addReminder") {
        setIsAdding(true);
      }
    };
    window.addEventListener("dexter:command-action", handler);
    return () => window.removeEventListener("dexter:command-action", handler);
  }, []);

  const addReminder = () => {
    if (!newReminder.trim()) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: newReminder.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setReminders([reminder, ...reminders]);
    setNewReminder("");
    setIsAdding(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r,
      ),
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {reminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="flex items-center gap-2 p-2 bg-surface border-border">
              <Checkbox
                checked={reminder.completed}
                onCheckedChange={() => toggleReminder(reminder.id)}
              />
              <span
                className={`flex-1 text-sm ${reminder.completed ? "line-through text-text-dim" : "text-foreground"}`}
              >
                {reminder.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-text-dim hover:text-red-500 dark:hover:text-red-400"
                onClick={() => deleteReminder(reminder.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            placeholder="Add reminder..."
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addReminder()}
            autoFocus
          />
          <Button size="sm" onClick={addReminder}>
            Add
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-text-muted"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add reminder
        </Button>
      )}
    </div>
  );
}
