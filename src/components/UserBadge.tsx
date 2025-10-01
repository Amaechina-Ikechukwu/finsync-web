"use client";
import { useCurrentUserProfile } from "@/lib/apiClient";

export interface UserBadgeProps {
  size?: "sm" | "md";
  showEmail?: boolean;
  className?: string;
  skeletonLines?: number;
}

export default function UserBadge({
  size = "md",
  showEmail = false,
  className = "",
  skeletonLines = 1,
}: UserBadgeProps) {
  const { profile, loading, error } = useCurrentUserProfile();

  const compact = size === "sm";

  if (loading) {
    return (
      <div
        className={`flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 ${className}`}
      >
        <div className="h-7 w-7 animate-pulse rounded-full bg-black/10" />
        <div className="flex flex-col gap-1">
          {Array.from({ length: skeletonLines }).map((_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: predictable static skeleton list
              key={i}
              className={`block h-2.5 w-${i === 0 ? "24" : "16"} animate-pulse rounded bg-black/10`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-50 px-3 py-1.5 text-rose-700 ${className}`}
      >
        <span className="text-xs font-semibold">Profile Error</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className={`flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-neutral-500 ${className}`}
      >
        <span className="text-xs">No profile</span>
      </div>
    );
  }

  const initials = extractInitials(profile.fullname || profile.email);

  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 ${className}`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-black/10 text-[0.7rem] font-semibold uppercase tracking-wide text-black ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className={`truncate font-medium text-black ${compact ? "text-xs" : "text-sm"}`}>
          {profile.fullname || profile.email}
        </span>
        {showEmail ? (
          <span className="truncate text-[10px] text-neutral-500">
            {profile.email.toLowerCase()}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function extractInitials(full: string) {
  return full
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
