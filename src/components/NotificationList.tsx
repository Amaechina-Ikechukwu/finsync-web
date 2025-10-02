"use client";
import { useNotifications } from "@/lib/apiClient";

interface NotificationListProps {
  limit?: number;
  pollIntervalMs?: number;
  className?: string;
  title?: string;
  filters?: { country?: string; operator?: string; product?: string };
}

export default function NotificationList({
  limit = 10,
  pollIntervalMs,
  className = "",
  title = "Notifications",
  filters,
}: NotificationListProps) {
  const { notifications, loading, error } = useNotifications({
    limit,
    pollIntervalMs,
    filters,
  });

  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 p-5 ${className}`}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
        {title}
      </h3>
      {loading && (
        <div className="py-6 text-sm text-neutral-500">
          Loading notifications...
        </div>
      )}
      {error && <div className="py-6 text-sm text-red-600">Error: {error}</div>}
      {!loading && !error && (!notifications || notifications.length === 0) && (
        <div className="py-6 text-sm text-neutral-500">
          No notifications yet.
        </div>
      )}
      {!loading && !error && notifications && notifications.length > 0 && (
        <ul className="divide-y divide-black/5">
          {notifications.map((n) => (
            <li key={n.id} className="flex gap-3 py-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 line-clamp-1">
                  {n.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-600 line-clamp-2">
                  {n.body}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-neutral-500">
                  {new Date(n.createdAt).toLocaleString()} • {n.type}
                </p>
              </div>
              {!n.isRead && (
                <span
                  className="ml-2 h-2 w-2 flex-shrink-0 self-start rounded-full bg-indigo-500"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {/* Future: mark all as read or pagination */}
    </div>
  );
}
