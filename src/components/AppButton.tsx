"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "subtle" | "ghost";
  size?: "xs" | "sm" | "md";
  loading?: boolean;
}

const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<string, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  subtle: "bg-black/5 text-neutral-800 hover:bg-black/10",
  ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50",
};
const sizes: Record<string, string> = {
  xs: "text-[11px] px-2 py-1 gap-1",
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ variant = "primary", size = "sm", className, loading, children, disabled, ...rest }, ref) => {
    const classes = [base, variants[variant], sizes[size], className]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {children}
      </button>
    );
  },
);
AppButton.displayName = "AppButton";
export default AppButton;
