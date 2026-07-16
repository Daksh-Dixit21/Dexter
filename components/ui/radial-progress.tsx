import * as React from "react";
import { cn } from "@/lib/utils";

function RadialProgress({
  value,
  size = 80,
  strokeWidth = 6,
  className,
  color,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: string;
  label?: string;
}) {
  const safeSize = Number.isFinite(size) && size > 0 ? size : 80;
  const safeStrokeWidth =
    Number.isFinite(strokeWidth) && strokeWidth > 0
      ? Math.min(strokeWidth, safeSize)
      : 6;
  const safeValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 100)
    : 0;
  const radius = Math.max((safeSize - safeStrokeWidth) / 2, 0);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeValue / 100) * circumference;

  const getColor = (val: number) => {
    if (color) return color;
    if (val >= 90) return "var(--color-error, #f87171)";
    if (val >= 70) return "var(--color-warning, #fbbf24)";
    return "var(--color-success, #34d399)";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg width={safeSize} height={safeSize} className="-rotate-90">
        <circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={safeStrokeWidth}
          className="text-border opacity-30"
        />
        <circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke={getColor(safeValue)}
          strokeWidth={safeStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-text">
          {label ?? `${Math.round(safeValue)}%`}
        </span>
      </div>
    </div>
  );
}

export { RadialProgress };
