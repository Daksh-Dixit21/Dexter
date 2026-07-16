"use client";

import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { QUOTES } from "@/lib/constants";
import { getDailyQuoteSeed, getGreeting } from "@/lib/utils";

export function Greeting() {
  const [userName] = useLocalStorage("dexter.userName", "Builder");
  const greeting = getGreeting();
  const seed = getDailyQuoteSeed();
  const quote = QUOTES[seed % QUOTES.length];

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-semibold text-text tracking-tight">
        {greeting}, {userName}
      </h1>
      <p className="text-sm text-text-muted italic max-w-lg">
        &ldquo;{quote}&rdquo;
      </p>
    </motion.div>
  );
}
