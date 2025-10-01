"use client";
import StatCard from "@/components/StatCard";
import { useTransactionSummary } from "@/lib/apiClient";
import { formatNumber } from "@/lib/format";

/**
 * Displays aggregated transaction statistics (last N days) as stat cards.
 */
export default function TransactionSummaryStats() {
  const { summary, loading, error } = useTransactionSummary();

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Failed to load transaction stats: {error}
      </div>
    );
  }

  const s = summary?.summary;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Tx Total"
        value={loading || !s ? "—" : formatNumber(s.total)}
        description={`Total transactions (last ${summary?.period ?? ".."}d)`}
      />
      <StatCard
        title="Completed"
        value={loading || !s ? "—" : formatNumber(s.completed)}
        description="Successful transactions"
        trend="up"
        subdued
      />
      <StatCard
        title="Failed"
        value={loading || !s ? "—" : formatNumber(s.failed)}
        description="Failed attempts"
        trend={s && s.failed > 0 ? "down" : "up"}
        subdued
      />
      <StatCard
        title="Pending"
        value={loading || !s ? "—" : formatNumber(s.pending)}
        description="Awaiting completion"
        subdued
      />
      <StatCard
        title="Total Amount"
        value={loading || !s ? "—" : s.totalAmount}
        description="Aggregate volume"
      />
    </div>
  );
}
