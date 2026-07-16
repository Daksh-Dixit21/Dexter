"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PageLayout } from "@/components/layout/PageLayout";
import { AppDock } from "@/components/layout/AppDock";
import { CommandPalette } from "@/components/command/CommandPalette";
import { Greeting } from "@/components/home/Greeting";
import { QuickActions } from "@/components/home/QuickActions";
import TodayMission from "@/components/home/TodayMission";
import FocusCard from "@/components/home/FocusCard";
import AttentionFeed from "@/components/home/AttentionFeed";
import RecentProjects from "@/components/home/RecentProjects";
import JourneyProgress from "@/components/home/JourneyProgress";
import MorningBrief from "@/components/brief/MorningBrief";
import FocusModule from "@/components/focus/FocusModule";
import VisionBoard from "@/components/vision/VisionBoard";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import TodoSystem from "@/components/todos/TodoSystem";
import DeployView from "@/components/deploy/DeployView";
import ProjectList from "@/components/projects/ProjectList";
import { ReadingList } from "@/components/reading/ReadingList";
import { ReminderList } from "@/components/reminders/ReminderList";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";

export default function Home() {
  const [onboardingComplete] = useLocalStorage("dexter.onboarding", false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState("home");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && onboardingComplete === false) {
      router.push("/onboarding");
    }
  }, [mounted, onboardingComplete, router]);

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  if (!mounted || onboardingComplete === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 animate-pulse mx-auto" />
          <p className="text-sm text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <CommandPalette />
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        {activeView === "home" && (
          <>
            <Greeting />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodayMission />
              <FocusCard />
            </div>
            <QuickActions />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MorningBrief />
              <JourneyProgress />
            </div>
            <RecentProjects />
          </>
        )}

        {activeView === "deploy" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Deployments</h1>
            <DeployView />
          </div>
        )}

        {activeView === "projects" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Projects</h1>
            <ProjectList />
          </div>
        )}

        {activeView === "reading" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Reading & Tasks</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ReadingList />
                <TodoSystem />
              </div>
              <div className="space-y-6">
                <ReminderList />
                <SubscriptionList />
              </div>
            </div>
          </div>
        )}

        {activeView === "focus" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Focus</h1>
            <FocusModule />
          </div>
        )}

        {activeView === "vision" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Vision Board</h1>
            <VisionBoard />
          </div>
        )}

        {activeView === "journey" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">Journey</h1>
            <JourneyTimeline />
          </div>
        )}
      </div>

      <AppDock activeView={activeView} onNavigate={handleNavigate} />
    </PageLayout>
  );
}
