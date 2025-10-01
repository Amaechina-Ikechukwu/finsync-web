"use client";
import type { ReactNode } from "react";

export interface ChartPlaceholderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  height?: number; // px
}

export default function ChartPlaceholder({
  title,
  subtitle,
  icon,
  height = 240,
}: ChartPlaceholderProps) {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-black/20 bg-white/50 p-5 backdrop-blur"
      style={{ minHeight: height }}
      aria-label={`${title} chart placeholder`}
      role="group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-black">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs text-neutral-600">{subtitle}</p>
          ) : null}
        </div>
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="pointer-events-none mt-6 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center text-center text-[0.6rem] font-medium uppercase tracking-[0.28em] text-neutral-400">
          <span>Future</span>
          <span>Chart</span>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 opacity-40" aria-hidden="true">
        <GridPattern />
      </div>
    </div>
  );
}

function GridPattern() {
  return (
    <svg
      className="h-full w-full text-neutral-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 400 400"
    >
      <defs>
        <pattern
          id="smallGrid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
        <pattern
          id="grid"
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
        >
          <rect width="100" height="100" fill="url(#smallGrid)" />
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
