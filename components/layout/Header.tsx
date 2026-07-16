"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-sm font-medium text-text-muted">Dexter</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-text-muted"
          onClick={() => {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true }),
            );
          }}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-surface-elevated px-1.5 font-mono text-[10px] text-text-dim">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>
    </header>
  );
}
