"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RadialProgress } from "@/components/ui/radial-progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Subscription {
  id: string;
  name: string;
  cost: number;
  budget: number;
  renewalDate: string;
}

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>("dexter.subscriptions", []);
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", cost: "", budget: "", renewalDate: "" });

  const addSubscription = () => {
    if (!newSub.name.trim() || !newSub.cost) return;
    const sub: Subscription = {
      id: crypto.randomUUID(),
      name: newSub.name.trim(),
      cost: Number.parseFloat(newSub.cost) * 100,
      budget: Number.parseFloat(newSub.budget || "100") * 100,
      renewalDate: newSub.renewalDate,
    };
    setSubscriptions([...subscriptions, sub]);
    setNewSub({ name: "", cost: "", budget: "", renewalDate: "" });
    setIsAdding(false);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.cost, 0);

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-2xl font-semibold text-text">${(totalMonthly / 100).toFixed(2)}</p>
        <p className="text-xs text-text-dim">monthly total</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {subscriptions.map((sub) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="relative p-3 flex flex-col items-center gap-1">
                <RadialProgress
                  value={(sub.cost / sub.budget) * 100}
                  size={60}
                  strokeWidth={5}
                />
                <p className="text-xs font-medium text-text truncate w-full text-center">{sub.name}</p>
                <p className="text-[10px] text-text-dim">${(sub.cost / 100).toFixed(0)}/mo</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5"
                  onClick={() => deleteSubscription(sub.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding ? (
        <Card className="p-3 space-y-2">
          <Input
            placeholder="Name"
            value={newSub.name}
            onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Cost/mo"
              value={newSub.cost}
              onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })}
              className="h-8 text-sm"
              type="number"
            />
            <Input
              placeholder="Budget"
              value={newSub.budget}
              onChange={(e) => setNewSub({ ...newSub, budget: e.target.value })}
              className="h-8 text-sm"
              type="number"
            />
          </div>
          <Input
            placeholder="Renewal date"
            value={newSub.renewalDate}
            onChange={(e) => setNewSub({ ...newSub, renewalDate: e.target.value })}
            className="h-8 text-sm"
            type="date"
          />
          <Button size="sm" onClick={addSubscription} className="w-full">
            Add
          </Button>
        </Card>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-text-muted"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add subscription
        </Button>
      )}
    </div>
  );
}
