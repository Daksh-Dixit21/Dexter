"use client";

import { ReminderList } from "@/components/reminders/ReminderList";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-72 border-l border-border/50 p-4 gap-6 overflow-y-auto">
      <div>
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Reminders</h2>
        <ReminderList />
      </div>
      <Separator />
      <div>
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Subscriptions</h2>
        <SubscriptionList />
      </div>
    </aside>
  );
}
