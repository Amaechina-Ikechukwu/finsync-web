"use client";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "subtle" | "ghost" | "outline";
  size?: "xs" | "sm" | "md";
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<string, string> = {
  primary: "bg-black text-white shadow hover:bg-black/90",
  subtle: "bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-200/60",
  outline:
    "border border-black/10 bg-white text-neutral-700 hover:bg-neutral-50",
};
const sizes: Record<string, string> = {
  xs: "text-[11px] px-3 py-1 gap-1",
  sm: "text-xs px-4 py-1.5 gap-1.5",
  md: "text-sm px-5 py-2 gap-2",
};

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant = "primary",
      size = "sm",
      className,
      loading,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
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
