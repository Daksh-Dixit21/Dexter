import * as React from "react";
import { cn } from "@/lib/utils";

function RadialProgress({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  color,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  const getColor = (val: number) => {
    if (color) return color;
    if (val >= 90) return "var(--color-error, #f87171)";
    if (val >= 70) return "var(--color-warning, #fbbf24)";
    return "var(--color-success, #34d399)";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border opacity-30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-text">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

export { RadialProgress };
