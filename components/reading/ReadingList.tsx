"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ReadingLink {
  id: string;
  url: string;
  title: string;
  addedAt: number;
}

const MAX_LINKS = 5;

export function ReadingList() {
  const [links, setLinks] = useLocalStorage<ReadingLink[]>(
    "dexter.reading",
    [],
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", title: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (event: Event) => {
      if ((event as CustomEvent<{ action: string }>).detail.action === "addReading") {
        setIsAdding(true);
        setError("");
      }
    };
    window.addEventListener("dexter:command-action", handler);
    return () => window.removeEventListener("dexter:command-action", handler);
  }, []);

  const addLink = () => {
    if (links.length >= MAX_LINKS) {
      setError("Finish your current reads before adding more!");
      return;
    }
    if (!newLink.url.trim()) return;

    const link: ReadingLink = {
      id: crypto.randomUUID(),
      url: newLink.url.trim(),
      title: newLink.title.trim() || new URL(newLink.url).hostname,
      addedAt: Date.now(),
    };
    setLinks([link, ...links]);
    setNewLink({ url: "", title: "" });
    setIsAdding(false);
    setError("");
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
    setError("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Reading List
          </h2>
        </div>
        <span className="text-xs text-text-dim">
          {links.length}/{MAX_LINKS}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {link.title}
                  </p>
                  <p className="text-xs text-text-dim truncate">{link.url}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeLink(link.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-warning">{error}</p>}

      {isAdding ? (
        <Card className="p-3 space-y-2">
          <Input
            placeholder="URL"
            value={newLink.url}
            onChange={(e) => {
              setNewLink({ ...newLink, url: e.target.value });
              setError("");
            }}
            className="h-8 text-sm"
            type="url"
            autoFocus
          />
          <Input
            placeholder="Title (optional)"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addLink} className="flex-1">
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-text-muted"
          onClick={() => {
            if (links.length >= MAX_LINKS) {
              setError("Finish your current reads before adding more!");
            } else {
              setIsAdding(true);
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Add reading link
        </Button>
      )}
    </div>
  );
}
