"use client";
import { useRecentTransactions } from "@/lib/apiClient";
import { formatCurrencyDetailed } from "@/lib/format";

interface RecentTransactionsProps {
  limit?: number;
  className?: string;
  title?: string;
}

export default function RecentTransactions({
  limit = 5,
  className = "",
  title = "Recent Transactions",
}: RecentTransactionsProps) {
  const { transactions, loading, error } = useRecentTransactions(limit);

  return (
    <div
      className={`rounded-2xl border border-black/10 bg-white/70 p-5 ${className}`}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
        {title}
      </h3>
      {loading && (
        <div className="py-6 text-sm text-neutral-500">
          Loading transactions...
        </div>
      )}
      {error && <div className="py-6 text-sm text-red-600">Error: {error}</div>}
      {!loading && !error && (!transactions || transactions.length === 0) && (
        <div className="py-6 text-sm text-neutral-500">
          No recent activity yet.
        </div>
      )}
      {!loading && !error && transactions && transactions.length > 0 && (
        <ul className="divide-y divide-black/5">
          {transactions.map((tx) => {
            const amountDisplay = formatCurrencyDetailed(tx.amount || 0);
            return (
              <li key={tx.id} className="flex items-center gap-4 py-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 line-clamp-1">
                    {tx.description || tx.transactionId}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-500">
                    {tx.type} • {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right tabular-nums font-medium text-neutral-700">
                  {amountDisplay}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-4 text-right">
        <button
          type="button"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
          // Placeholder for future navigation
          onClick={() => {
            /* TODO: navigate to full transactions page */
          }}
        >
          View All
        </button>
      </div>
    </div>
  );
}
