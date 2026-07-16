"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  Info,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn, formatRelativeTime } from "@/lib/utils";

interface FeedItem {
  id: string;
  title: string;
  description: string;
  type: "info" | "warning" | "error";
  timestamp: number;
  read: boolean;
}

const DEFAULT_ITEMS: FeedItem[] = [
  {
    id: "welcome-1",
    title: "Welcome to Dexter!",
    description:
      "Your calm builder companion. Set up your integrations to get started.",
    type: "info",
    timestamp: Date.now() - 86400000,
    read: false,
  },
  {
    id: "github-connect",
    title: "Connect GitHub",
    description:
      "Connect your GitHub account to track repositories and deployments.",
    type: "info",
    timestamp: Date.now() - 43200000,
    read: false,
  },
];

function typeConfig(type: FeedItem["type"]) {
  switch (type) {
    case "error":
      return {
        color: "bg-red-400",
        icon: AlertCircle,
        badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    case "warning":
      return {
        color: "bg-yellow-400",
        icon: AlertTriangle,
        badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      };
    case "info":
    default:
      return {
        color: "bg-blue-400",
        icon: Info,
        badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      };
  }
}

export default function AttentionFeed() {
  const [items, setItems] = useLocalStorage<FeedItem[]>(
    "dexter.attentionFeed",
    DEFAULT_ITEMS,
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && items.length === 0) {
      setItems(DEFAULT_ITEMS);
      setInitialized(true);
    } else {
      setInitialized(true);
    }
  }, [initialized, items.length, setItems]);

  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const clearAll = () => {
    setItems([]);
  };

  const unreadItems = items.filter((i) => !i.read);
  const readItems = items.filter((i) => i.read);
  const sortedItems = [...unreadItems, ...readItems];

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-muted">
            <Bell className="h-4 w-4 text-accent" />
            Attention Feed
          </CardTitle>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-text-dim hover:text-red-400 h-7 px-2 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        {unreadItems.length > 0 && (
          <Badge
            variant="secondary"
            className="w-fit text-xs bg-accent/20 text-accent border-accent/30"
          >
            {unreadItems.length} unread
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="popLayout">
          {sortedItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 mb-3">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-text-muted text-sm">
                All clear! Nothing needs attention.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-1">
              {sortedItems.map((item, idx) => {
                const config = typeConfig(item.type);
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-colors",
                      item.read
                        ? "opacity-50 hover:opacity-70"
                        : "bg-surface-elevated/50 hover:bg-surface-elevated",
                    )}
                  >
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full mt-2 shrink-0",
                        config.color,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-text text-sm font-medium truncate">
                          {item.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            config.badgeClass,
                          )}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-text-muted text-xs leading-relaxed">
                        {item.description}
                      </p>
                      <span className="text-text-dim text-[10px] mt-1 block">
                        {formatRelativeTime(new Date(item.timestamp))}
                      </span>
                    </div>
                    {!item.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(item.id)}
                        className="h-7 px-2 text-text-dim hover:text-accent shrink-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
