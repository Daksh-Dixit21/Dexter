"use client";

import { CommandPalette } from "@/components/command/CommandPalette";
import { MascotCompanion } from "@/components/mascot/MascotCompanion";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <CommandPalette />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Sidebar />
      </div>
      <MascotCompanion />
    </div>
  );
}
