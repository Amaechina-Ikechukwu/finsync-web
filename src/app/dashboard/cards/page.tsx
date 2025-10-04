"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useDollarCardDetails,
  useDollarCardBalance,
  updateStrowalletCustomer,
  getDollarFundEstimate,
} from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastProvider";

function classNames(...tokens: (false | null | undefined | string)[]) {
  return tokens.filter(Boolean).join(" ");
}

function DollarCardPanel() {
  const {
    card,
    loading: loadingCard,
    error: cardError,
  } = useDollarCardDetails();
  const { balance, loading: loadingBal } = useDollarCardBalance();
  const { getIdToken } = useAuth();
  const { push } = useToast();
  const [saving, setSaving] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [lastQuoteOk, setLastQuoteOk] = useState<boolean | null>(null);

  const [form, setForm] = useState({ phoneNumber: "", line1: "", city: "" });
  const maskedPan = useMemo(() => {
    if (!card?.last4) return "•••• •••• •••• ••••";
    return `•••• •••• •••• ${card.last4}`;
  }, [card?.last4]);

  if (loadingCard) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <p className="text-sm text-neutral-600">Loading dollar card…</p>
      </div>
    );
  }
  if (cardError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load dollar card: {cardError}
      </div>
    );
  }

  if (!card) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col gap-3">
        <h3 className="text-sm font-semibold tracking-tight">No Dollar Card</h3>
        <p className="text-sm text-neutral-600">
          You don’t have a dollar card yet. Create one to start spending in USD.
        </p>
        <div>
          <Link
            href="/dashboard/cards/create-dollar"
            className="inline-flex items-center rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow hover:bg-black/90"
          >
            Create Dollar Card
          </Link>
        </div>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("No auth token");
      await updateStrowalletCustomer(token, card.customer_id, form, {
        email: card.customer_email,
      });
      push({
        variant: "success",
        title: "Billing updated",
        description: "Customer profile synced successfully.",
      });
    } catch (err) {
      push({
        variant: "error",
        title: "Update failed",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const amount = Number(fd.get("amount"));
    if (!amount || Number.isNaN(amount)) return;
    setQuoteLoading(true);
    setQuoteError(null);
    setLastQuoteOk(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("No auth token");
      await getDollarFundEstimate(token, amount);
      setLastQuoteOk(true);
      push({
        variant: "success",
        title: "Estimate requested",
        description: "Check your email or logs for the detailed quote.",
      });
    } catch (err) {
      setQuoteError((err as Error).message);
      setLastQuoteOk(false);
      push({
        variant: "error",
        title: "Estimate failed",
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Card
          </p>
          <p className="text-lg font-semibold tracking-tight">
            {card.card_brand} • {maskedPan}
          </p>
          <p className="text-xs text-neutral-500">Status: {card.card_status}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Available Balance
            </p>
            <p className="mt-1 text-xl font-semibold">
              {loadingBal
                ? "…"
                : balance
                  ? `$${balance.available_balance.toFixed(2)}`
                  : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-black/10 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Ledger Balance
            </p>
            <p className="mt-1 text-xl font-semibold">
              {loadingBal
                ? "…"
                : balance
                  ? `$${balance.ledger_balance.toFixed(2)}`
                  : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleUpdate}
          className="rounded-2xl border border-black/10 bg-white/70 p-6 space-y-4"
        >
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Update Billing Details
            </h3>
            <p className="text-xs text-neutral-600">
              Email: {card.customer_email}
            </p>
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-medium text-neutral-700">
              Phone Number
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phoneNumber: e.target.value }))
                }
                placeholder="+15551234567"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              Address Line 1
              <input
                name="line1"
                value={form.line1}
                onChange={(e) =>
                  setForm((s) => ({ ...s, line1: e.target.value }))
                }
                placeholder="123 Main St"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
            <label className="text-xs font-medium text-neutral-700">
              City
              <input
                name="city"
                value={form.city}
                onChange={(e) =>
                  setForm((s) => ({ ...s, city: e.target.value }))
                }
                placeholder="San Francisco"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={classNames(
                "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold shadow",
                saving
                  ? "bg-neutral-300 text-neutral-600"
                  : "bg-black text-white hover:bg-black/90",
              )}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleQuote}
          className="rounded-2xl border border-black/10 bg-white/70 p-6 space-y-4"
        >
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              Get Fund Estimate
            </h3>
            <p className="text-xs text-neutral-600">
              Check fees and final amount for funding your USD card.
            </p>
          </div>
          <div className="grid gap-3">
            <label className="text-xs font-medium text-neutral-700">
              Amount (USD)
              <input
                name="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="5.00"
                className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/20"
              />
            </label>
          </div>
          {quoteError && <p className="text-xs text-red-600">{quoteError}</p>}
          {lastQuoteOk && (
            <p className="text-xs text-emerald-700">Estimate retrieved.</p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={quoteLoading}
              className={classNames(
                "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold shadow",
                quoteLoading
                  ? "bg-neutral-300 text-neutral-600"
                  : "bg-black text-white hover:bg-black/90",
              )}
            >
              {quoteLoading ? "Requesting…" : "Get Estimate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [tab, setTab] = useState<"dollar" | "naira">("dollar");
  const [nairaSubtab, setNairaSubtab] = useState<"virtual" | "physical">(
    "virtual",
  );

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab === "dollar" || urlTab === "naira") {
      setTab((prev) => (prev === urlTab ? prev : urlTab));
    } else if (tab !== "dollar") {
      setTab("dollar");
    }
  }, [searchParams, tab]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      push({
        variant: "success",
        title: "Dollar card created",
        description: "You can now manage it here.",
      });
      const params = new URLSearchParams(searchParams.toString());
      params.delete("created");
      const query = params.toString();
      router.replace(query ? `/dashboard/cards?${query}` : "/dashboard/cards");
    }
  }, [push, router, searchParams]);

  const updateTab = (nextTab: "dollar" | "naira") => {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", nextTab);
    params.delete("created");
    const query = params.toString();
    router.replace(query ? `/dashboard/cards?${query}` : "/dashboard/cards");
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Cards</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Issue, manage, and monitor physical & virtual payment cards.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["dollar", "naira"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => updateTab(t)}
            className={classNames(
              "relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition",
              tab === t
                ? "bg-black text-white shadow"
                : "bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300",
            )}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "dollar" && <DollarCardPanel />}

      {tab === "naira" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {(["virtual", "physical"] as const).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setNairaSubtab(t)}
                className={classNames(
                  "relative rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition",
                  nairaSubtab === t
                    ? "bg-black text-white shadow"
                    : "bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 text-sm text-neutral-600">
            Naira {nairaSubtab} card UI coming soon…
          </div>
        </div>
      )}
    </div>
  );
}
