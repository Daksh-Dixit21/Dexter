"use client";

import { QUOTES } from "@/lib/constants";
import { getDailyQuoteSeed } from "@/lib/utils";

export function MotivationalQuote() {
  const seed = getDailyQuoteSeed();
  const quoteIndex = seed % QUOTES.length;
  const quote = QUOTES[quoteIndex];

  return (
    <p className="text-sm text-text-muted italic max-w-lg">
      &ldquo;{quote}&rdquo;
    </p>
  );
}
