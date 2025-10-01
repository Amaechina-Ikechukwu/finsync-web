"use client";
import { ReactNode } from "react";

export type StatTrend = "up" | "down" | "flat";

export interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string; // e.g. +12.3%
  trend?: StatTrend;
  icon?: ReactNode;
  subdued?: boolean;
  description?: string;
}

const trendColor: Record<StatTrend, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  flat: "text-neutral-500",
};

const trendArrow: Record<StatTrend, string> = {
  up: "▲",
  down: "▼",
  flat: "—",
};

export default function StatCard({
  title,
  value,
  delta,
  trend = "flat",
  icon,
  subdued = false,
  description,
}: StatCardProps) {
  return (
    <div
      className={`group relative flex flex-col rounded-2xl border p-5 transition ${
        subdued
          ? "border-black/10 bg-white/60 hover:border-black/30"
          : "border-black/10 bg-white/80 hover:border-black/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
            {title}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold tracking-tight text-black">
              {value}
            </span>
            {delta ? (
              <span
                className={`flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wide ${trendColor[trend]}`}
              >
                <span>{trendArrow[trend]}</span>
                {delta}
              </span>
            ) : null}
          </div>
        </div>
        {icon ? (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black">
            {icon}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-3 text-xs leading-5 text-neutral-600">{description}</p>
      ) : null}
    </div>
  );
}
