"use client";
import type { ReactNode } from "react";
import Image from "next/image";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target?: string;
  time: string; // relative or ISO
  icon?: ReactNode;
  meta?: string;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
  emptyLabel?: string;
}

export default function ActivityFeed({
  items,
  title = "Recent activity",
  emptyLabel = "No recent activity",
}: ActivityFeedProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-black/10 bg-white/70 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-black">
          {title}
        </h3>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-neutral-500">
          {items.length} entries
        </span>
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-black/5">
        {items.length === 0 ? (
          <li className="py-6 text-center text-xs text-neutral-500">
            {emptyLabel}
          </li>
        ) : null}
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 py-3 text-sm">
            <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
              {/* Animated gradient ring */}
              <span
                aria-hidden
                className="animated-ring pointer-events-none absolute inset-0 rounded-full"
              />
              {/* Logo (falls back to provided icon if explicitly passed) */}
              {item.icon ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-black">
                  {item.icon}
                </span>
              ) : (
                <Image
                  src="/assets/logo.png"
                  alt="Finsync logo"
                  width={32}
                  height={32}
                  className="relative z-10 h-7 w-7 rounded-full object-cover"
                  priority
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-neutral-700">
                <span className="font-semibold text-black">{item.actor}</span>{" "}
                {item.action}
                {item.target ? (
                  <>
                    {" "}
                    <span className="font-medium text-black">
                      {item.target}
                    </span>
                  </>
                ) : null}
              </p>
              {item.meta ? (
                <p className="text-xs text-neutral-500">{item.meta}</p>
              ) : null}
            </div>
            <time
              dateTime={item.time}
              className="ml-auto flex-shrink-0 text-[0.6rem] font-semibold uppercase tracking-[0.26em] text-neutral-500"
            >
              {formatRelative(item.time)}
            </time>
          </li>
        ))}
      </ul>
      {/* Component-scoped styles for animated ring */}
      <style jsx>{`
        .animated-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px; /* perfect circle */
          background: conic-gradient(#6366f1, #ec4899, #f59e0b, #10b981, #6366f1);
          animation: finsync-ring-rotate 6s linear infinite;
          /* Create hollow center (ring) using mask */
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          padding: 2px; /* thickness of ring */
        }
        @keyframes finsync-ring-rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function formatRelative(time: string) {
  // Very lightweight relative formatting fallback
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Now";
  if (diffMin < 60) return diffMin + "m";
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH + "h";
  const diffD = Math.floor(diffH / 24);
  return diffD + "d";
}
