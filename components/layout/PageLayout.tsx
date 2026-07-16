"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MascotBubble } from "@/components/mascot/MascotBubble";
import { useMascot } from "@/hooks/useMascot";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const { mood, triggerClick } = useMascot();
  const [mascotSize] = useLocalStorage<"sm" | "md" | "lg">("dexter.mascotSize", "md");

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Sidebar />
      </div>
      <div className="fixed bottom-20 right-6 z-40 lg:bottom-6">
        <MascotBubble
          mood={mood}
          onClick={triggerClick}
          size={mascotSize}
        />
      </div>
    </div>
  );
}
