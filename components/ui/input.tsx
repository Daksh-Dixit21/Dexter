import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border-2 border-input bg-transparent px-3 py-1 text-sm text-text shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "border-error focus-visible:border-error focus-visible:ring-error/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
