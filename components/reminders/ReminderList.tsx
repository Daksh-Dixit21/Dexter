"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Bell } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Reminder {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  telegram: boolean;
}

export function ReminderList() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>("dexter.reminders", []);
  const [newReminder, setNewReminder] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addReminder = () => {
    if (!newReminder.trim()) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      text: newReminder.trim(),
      completed: false,
      createdAt: Date.now(),
      telegram: false,
    };
    setReminders([reminder, ...reminders]);
    setNewReminder("");
    setIsAdding(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
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
            <Card className="flex items-center gap-2 p-2">
              <Checkbox
                checked={reminder.completed}
                onCheckedChange={() => toggleReminder(reminder.id)}
              />
              <span className={`flex-1 text-sm ${reminder.completed ? "line-through text-text-dim" : "text-text"}`}>
                {reminder.text}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
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
