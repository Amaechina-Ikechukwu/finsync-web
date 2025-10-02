"use client";
import { useCurrentUserProfile } from "@/lib/apiClient";
import Loader from "./Loader";

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
      <div className={className}>
        <Loader size={compact ? 48 : 64} speed={1.3} message={compact ? undefined : "Loading profile"} />
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
