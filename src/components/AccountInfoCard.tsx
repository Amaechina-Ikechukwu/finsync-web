"use client";
import { useAccountDetails } from "@/lib/apiClient";
import { formatCurrency } from "@/lib/format";

/**
 * Displays the authenticated user's primary account details.
 * Fetches from /accounts/details via useAccountDetails hook.
 */
export default function AccountInfoCard() {
  const { details, loading, error } = useAccountDetails();

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
        Account
      </h3>
      {loading ? (
        <div className="animate-pulse space-y-2 text-xs text-neutral-400">
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-24 rounded bg-neutral-200" />
          <div className="h-5 w-40 rounded bg-neutral-200" />
        </div>
      ) : error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : details ? (
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-500">
              Bank Name
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {details.bank_name}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-500">
                Account Number
              </p>
              <p className="font-mono text-sm font-semibold text-neutral-900">
                {details.account_number}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-[0.55rem] font-semibold uppercase tracking-wide ${
                details.account_status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20"
                  : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-400/30"
              }`}
            >
              {details.account_status}
            </span>
          </div>
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-500">
              Balance
            </p>
            <p className="text-2xl font-semibold tracking-tight text-black">
              {formatCurrency(details.amount, "NGN", "en-NG")}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-neutral-500">No account information.</p>
      )}
    </div>
  );
}
