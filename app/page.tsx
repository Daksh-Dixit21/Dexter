"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MorningBrief from "@/components/brief/MorningBrief";
import DeployView from "@/components/deploy/DeployView";
import FocusModule from "@/components/focus/FocusModule";
import FocusCard from "@/components/home/FocusCard";
import { Greeting } from "@/components/home/Greeting";
import { IntegrationRow } from "@/components/home/IntegrationRow";
import JourneyProgress from "@/components/home/JourneyProgress";
import { QuickActions } from "@/components/home/QuickActions";
import RecentProjects from "@/components/home/RecentProjects";
import TodayMission from "@/components/home/TodayMission";
import JourneyTimeline from "@/components/journey/JourneyTimeline";
import { AppDock } from "@/components/layout/AppDock";
import { PageLayout } from "@/components/layout/PageLayout";
import ProjectList from "@/components/projects/ProjectList";
import { ReadingList } from "@/components/reading/ReadingList";
import { ReminderList } from "@/components/reminders/ReminderList";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { TelegramReminder } from "@/components/todos/TelegramReminder";
import TodoSystem from "@/components/todos/TodoSystem";
import VisionBoard from "@/components/vision/VisionBoard";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface GHRepo {
  full_name: string;
  name: string;
  [key: string]: any;
}

// Custom event name for cross-component navigation
const NAV_EVENT = "dexter:navigate";
const APP_ACTION_EVENT = "dexter:command-action";
const VALID_VIEWS = new Set([
  "home",
  "deploy",
  "projects",
  "reading",
  "focus",
  "vision",
  "journey",
]);

/** Helper to dispatch a nav event from any child component */
export function dispatchNav(view: string) {
  window.dispatchEvent(new CustomEvent(NAV_EVENT, { detail: { view } }));
}

export default function Home() {
  const [onboardingComplete] = useLocalStorage("dexter.onboarding", false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const [deployRepo, setDeployRepo] = useState<GHRepo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Read initial ?tab= from URL ────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const action = params.get("action");
    if (tab && VALID_VIEWS.has(tab)) setActiveView(tab);
    if (action) {
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(APP_ACTION_EVENT, { detail: { action } }),
        );
      }, 0);
    }
  }, [mounted]);

  // ── Listen for child-component navigation events ────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const view = (e as CustomEvent<{ view: string }>).detail.view;
      if (!VALID_VIEWS.has(view)) return;
      setActiveView(view);
      // Update URL without triggering a full navigation
      const url = new URL(window.location.href);
      url.searchParams.set("tab", view);
      window.history.pushState({}, "", url.toString());
    };
    window.addEventListener(NAV_EVENT, handler);
    return () => window.removeEventListener(NAV_EVENT, handler);
  }, []);

  useEffect(() => {
    if (mounted && onboardingComplete === false) {
      router.push("/onboarding");
    }
  }, [mounted, onboardingComplete, router]);

  // Theme init on first load
  useEffect(() => {
    if (mounted) {
      const theme = localStorage.getItem("dexter.theme");
      if (theme) {
        const parsed = JSON.parse(theme);
        document.documentElement.classList.toggle("dark", parsed === "dark");
      } else {
        // Default to dark
        document.documentElement.classList.add("dark");
      }
    }
  }, [mounted]);

  const handleNavigate = (view: string) => {
    if (!VALID_VIEWS.has(view)) return;
    setActiveView(view);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", view);
    window.history.pushState({}, "", url.toString());
  };

  const handleConnectDeploy = (repo: GHRepo) => {
    setDeployRepo(repo);
    handleNavigate("deploy");
  };

  if (!mounted || onboardingComplete === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 animate-pulse mx-auto" />
          <p className="text-sm text-text-muted">Loading Dexter...</p>
        </div>
      </div>
    );
  }

  const VIEW_TITLES: Record<string, string> = {
    deploy: "Deployments",
    projects: "Repositories",
    reading: "Tasks & Reading",
    focus: "Focus",
    vision: "Vision Board",
    journey: "Journey",
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        {/* ─── Home ─── */}
        {activeView === "home" && (
          <>
            <Greeting />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodayMission />
              <FocusCard />
            </div>
            <QuickActions />
            <IntegrationRow />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MorningBrief />
              <JourneyProgress />
            </div>
            <RecentProjects />
          </>
        )}

        {/* ─── Deploy ─── */}
        {activeView === "deploy" && (
          <div className="space-y-6">
            <DeployView initialRepo={deployRepo} />
          </div>
        )}

        {/* ─── Projects / Repos ─── */}
        {activeView === "projects" && (
          <div className="space-y-6">
            <ProjectList onConnectDeploy={handleConnectDeploy} />
          </div>
        )}

        {/* ─── Tasks & Reading ─── */}
        {activeView === "reading" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">
              {VIEW_TITLES["reading"]}
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ReadingList />
                <TodoSystem />
              </div>
              <div className="space-y-6">
                <ReminderList />
                <TelegramReminder />
                <SubscriptionList />
              </div>
            </div>
          </div>
        )}

        {/* ─── Focus ─── */}
        {activeView === "focus" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">
              {VIEW_TITLES["focus"]}
            </h1>
            <FocusModule />
          </div>
        )}

        {/* ─── Vision ─── */}
        {activeView === "vision" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">
              {VIEW_TITLES["vision"]}
            </h1>
            <VisionBoard />
          </div>
        )}

        {/* ─── Journey ─── */}
        {activeView === "journey" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-text">
              {VIEW_TITLES["journey"]}
            </h1>
            <JourneyTimeline />
          </div>
        )}
      </div>

      <AppDock activeView={activeView} onNavigate={handleNavigate} />
    </PageLayout>
  );
}
