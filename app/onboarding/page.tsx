"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Globe,
  Rocket,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GitHubIcon } from "@/components/ui/github-icon";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const steps = [
  {
    id: "welcome",
    title: "Welcome to Dexter",
    subtitle: "A calm companion for builders",
  },
  {
    id: "name",
    title: "What should we call you?",
    subtitle: "We'll use this for greetings",
  },
  {
    id: "mission",
    title: "What's your mission?",
    subtitle: "Help us personalize your experience",
  },
  {
    id: "building",
    title: "What are you building?",
    subtitle: "Tell us about your current project",
  },
  {
    id: "github",
    title: "Connect GitHub",
    subtitle: "Access your repositories",
  },
  { id: "vercel", title: "Connect Vercel", subtitle: "Deploy with ease" },
  {
    id: "netlify",
    title: "Connect Netlify",
    subtitle: "Alternative deployment",
  },
  {
    id: "goals",
    title: "Set your long-term goals",
    subtitle: "What do you want to achieve?",
  },
  {
    id: "week",
    title: "Plan this week",
    subtitle: "What do you want to ship this week?",
  },
  {
    id: "finish",
    title: "Let's build together!",
    subtitle: "Everything is ready",
  },
];

const missions = [
  { id: "student", label: "Student", emoji: "📚" },
  { id: "indie", label: "Indie Hacker", emoji: "🚀" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "hobbyist", label: "Hobbyist", emoji: "🎨" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useLocalStorage("dexter.userName", "");
  const [userMission, setUserMission] = useLocalStorage("dexter.mission", "");
  const [projectName, setProjectName] = useLocalStorage(
    "dexter.currentProject",
    "",
  );
  const [goals, setGoals] = useLocalStorage("dexter.weeklyGoals", "");
  const [longTermGoals, setLongTermGoals] = useLocalStorage<
    {
      id: string;
      title: string;
      description: string;
      category: string;
      targetDate: string;
      status: string;
    }[]
  >("dexter.visionBoard", []);
  const [goalInput, setGoalInput] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useLocalStorage(
    "dexter.onboarding",
    false,
  );
  const router = useRouter();

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const next = () => {
    if (isLast) {
      setOnboardingComplete(true);
      router.push("/");
    } else {
      setStep(step + 1);
    }
  };

  const skip = () => {
    setOnboardingComplete(true);
    router.push("/");
  };

  const addGoal = () => {
    if (goalInput.trim()) {
      setLongTermGoals([
        ...longTermGoals,
        {
          id: Date.now().toString(),
          title: goalInput.trim(),
          description: "",
          category: "Career",
          targetDate: "",
          status: "not started",
        },
      ]);
      setGoalInput("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">🤖</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold text-text">
                {currentStep.title}
              </h1>
              <p className="text-sm text-text-muted">{currentStep.subtitle}</p>
            </div>

            {currentStep.id === "name" && (
              <Input
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="text-center"
                autoFocus
              />
            )}

            {currentStep.id === "mission" && (
              <div className="grid grid-cols-2 gap-3">
                {missions.map((m) => (
                  <Button
                    key={m.id}
                    variant={userMission === m.id ? "default" : "outline"}
                    className="h-20 flex-col gap-1"
                    onClick={() => setUserMission(m.id)}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs">{m.label}</span>
                  </Button>
                ))}
              </div>
            )}

            {currentStep.id === "building" && (
              <Input
                placeholder="What are you building?"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-center"
                autoFocus
              />
            )}

            {currentStep.id === "github" && (
              <Button variant="outline" className="w-full gap-2">
                <GitHubIcon className="h-4 w-4" />
                Connect GitHub
              </Button>
            )}

            {currentStep.id === "vercel" && (
              <Button variant="outline" className="w-full gap-2">
                <Rocket className="h-4 w-4" />
                Connect Vercel
              </Button>
            )}

            {currentStep.id === "netlify" && (
              <Button variant="outline" className="w-full gap-2">
                <Globe className="h-4 w-4" />
                Connect Netlify
              </Button>
            )}

            {currentStep.id === "goals" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a long-term goal"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  />
                  <Button size="sm" onClick={addGoal}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {longTermGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center gap-2 text-sm text-text p-2 bg-surface-elevated rounded-lg"
                    >
                      <Target className="h-3 w-3 text-accent" />
                      {goal.title}
                    </div>
                  ))}
                  {longTermGoals.length === 0 && (
                    <p className="text-xs text-text-dim text-center py-4">
                      Add goals like "Launch Dexter", "100 Users", "First
                      Revenue"
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep.id === "week" && (
              <textarea
                placeholder="What do you want to ship this week?"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-dim resize-none outline-none focus:border-accent"
              />
            )}

            {currentStep.id === "finish" && (
              <div className="text-center space-y-4">
                <p className="text-sm text-text-muted">
                  Everything is ready. Let&apos;s build together.
                </p>
                <div className="flex justify-center gap-2">
                  {["✅", "🚀", "🎉"].map((e, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.2, type: "spring" }}
                      className="text-3xl"
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={skip} className="flex-1">
            Skip
          </Button>
          <Button onClick={next} className="flex-1 gap-2">
            {isLast ? (
              <>
                <Check className="h-4 w-4" />
                Get Started
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <div className="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-accent"
                  : i < step
                    ? "w-1.5 bg-accent/50"
                    : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
