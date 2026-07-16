"use client";

import { Clock, GitCommit } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Workspace() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
        Recent Activity
      </h3>
      <div className="space-y-2">
        {[
          {
            title: "Pushed to main",
            repo: "dexter-dev",
            time: "2 hours ago",
            icon: GitCommit,
          },
          {
            title: "Deployment succeeded",
            repo: "portfolio",
            time: "5 hours ago",
            icon: GitCommit,
          },
          {
            title: "Created issue #42",
            repo: "dexter-dev",
            time: "Yesterday",
            icon: GitCommit,
          },
        ].map((activity, i) => (
          <Card
            key={i}
            className="flex items-center gap-3 p-3 cursor-pointer hover:border-accent/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-surface-elevated flex items-center justify-center">
              <activity.icon className="h-4 w-4 text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">
                {activity.title}
              </p>
              <p className="text-xs text-text-dim">{activity.repo}</p>
            </div>
            <div className="flex items-center gap-1 text-text-dim">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{activity.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
