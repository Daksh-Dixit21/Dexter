"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { MascotBubble } from "@/components/mascot/MascotBubble";
import { PageLayout } from "@/components/layout/PageLayout";
import { AppDock } from "@/components/layout/AppDock";
import { Moon, Sun, User, Palette, RotateCcw, Heart } from "lucide-react";
import { MOOD_COLORS, type Mood } from "@/lib/constants";

const MOOD_LABELS: Record<Mood, string> = {
  idle: "Idle",
  happy: "Happy",
  affection: "Affection",
  success: "Success",
  thinking: "Thinking",
  confused: "Confused",
  concerned: "Concerned",
  sleeping: "Sleeping",
};

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useLocalStorage("dexter.userName", "Builder");
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("dexter.theme", "dark");
  const [mascotSize, setMascotSize] = useLocalStorage<"sm" | "md" | "lg">("dexter.mascotSize", "md");
  const [previewMood, setPreviewMood] = useState<Mood>("idle");
  const [petCount, setPetCount] = useLocalStorage("dexter.petCount", 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-24">
        <div>
          <h1 className="text-2xl font-semibold text-text">Settings</h1>
          <p className="text-sm text-text-muted">Customize your Dexter experience</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-text-muted" />
            <h2 className="text-lg font-medium text-text">Profile</h2>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-text-muted">Your Name</label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-text-muted" />
            <h2 className="text-lg font-medium text-text">Appearance</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Mascot Size</label>
            <div className="flex gap-2">
              {(["sm", "md", "lg"] as const).map((size) => (
                <Button
                  key={size}
                  variant={mascotSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMascotSize(size)}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Preview Mood</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(MOOD_COLORS) as Mood[]).map((m) => (
                <Button
                  key={m}
                  variant={previewMood === m ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMood(m)}
                  className="text-xs"
                >
                  {MOOD_LABELS[m]}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Dexter Preview</p>
            <p className="text-xs text-text-dim">Click to interact, use panel for reactions</p>
          </div>
          <div className="flex items-center justify-center py-6">
            <MascotBubble
              mood={previewMood}
              size={mascotSize}
            />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-text-dim">
            <span>Total pets: {petCount}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPetCount(0)}
              className="gap-1 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>
        </Card>
      </div>

      <AppDock activeView="settings" onNavigate={(v) => {}} />
    </PageLayout>
  );
}
