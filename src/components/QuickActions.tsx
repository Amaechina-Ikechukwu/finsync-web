"use client";
import type { ReactNode } from "react";

export interface QuickAction {
  id: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

export default function QuickActions({
  actions,
  title = "Quick actions",
}: QuickActionsProps) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white/80 p-5">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-black">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const isPrimary = action.variant === "primary";
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              className={`group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 ${
                isPrimary
                  ? "border-black bg-black text-white hover:bg-black/90"
                  : "border-black/10 bg-white/70 hover:border-black/30 hover:bg-white"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-sm font-semibold tracking-wide ${
                    isPrimary ? "text-white" : "text-black"
                  }`}
                >
                  {action.label}
                </span>
                {action.icon ? (
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      isPrimary ? "bg-white/15" : "bg-black/5"
                    }`}
                  >
                    {action.icon}
                  </span>
                ) : null}
              </div>
              {action.description ? (
                <span
                  className={`text-xs leading-5 ${
                    isPrimary ? "text-white/70" : "text-neutral-600"
                  }`}
                >
                  {action.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
