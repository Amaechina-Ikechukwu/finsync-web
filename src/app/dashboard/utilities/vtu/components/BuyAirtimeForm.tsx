"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { buyAirtime, type BuyAirtimeSuccessData } from "@/lib/apiClient";
import { useToast } from "@/components/toast/ToastProvider";

interface FormState {
  phone: string;
  network_id: string;
  amount: string; // store as string for easy binding
  reference?: string;
  payment_source: string; // not yet used in API call if backend expects wallet only
}

const NETWORKS = [
  { id: "mtn", label: "MTN" },
  { id: "airtel", label: "Airtel" },
  { id: "glo", label: "Glo" },
  { id: "9mobile", label: "9mobile" },
];

function classNames(...tokens: (false | null | undefined | string)[]) {
  return tokens.filter(Boolean).join(" ");
}

export function BuyAirtimeForm() {
  const { getIdToken, user } = useAuth();
  const [form, setForm] = useState<FormState>({
    phone: "",
    network_id: "mtn",
    amount: "100",
    payment_source: "wallet",
    reference: "",
  });
  const [submitting, setSubmitting] = useState(false);
  // local error state removed in favor of toast notifications
  const [result, setResult] = useState<BuyAirtimeSuccessData | null>(null);
  const { push } = useToast();

  const disabled = submitting || !user;

  const onChange = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): string | null => {
    if (!/^0\d{10}$/.test(form.phone)) return "Enter a valid 11-digit Nigerian phone (starts with 0)";
    const amt = Number(form.amount);
    if (Number.isNaN(amt) || amt < 10) return "Minimum amount is 10";
    if (!form.network_id) return "Select a network";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const validationError = validate();
    if (validationError) {
      push({
        variant: "error",
        title: "Validation Error",
        description: validationError,
      });
      return;
    }
    try {
      setSubmitting(true);
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      const request_id = form.reference?.trim() || `req_${Date.now()}`; // fallback
      const payload = {
        phone: form.phone,
        amount: form.amount,
        network_id: form.network_id,
        request_id,
      };
      const data = await buyAirtime(token, payload);
      setResult(data);
      push({
        variant: "success",
        title: "Airtime Purchased",
        description: `${data.service_name} NGN ${data.amount} → ${data.phone}`,
      });
      // Optionally reset amount only
      setForm((f) => ({ ...f, reference: "" }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      push({
        variant: "error",
        title: "Purchase Failed",
        description: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-md text-sm">
        <Field label="Phone Number" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. 07012345678"
            className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            required
          />
        </Field>
        <Field label="Network" htmlFor="network_id">
          <select
            id="network_id"
            value={form.network_id}
            onChange={(e) => onChange("network_id", e.target.value)}
            className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            required
          >
            {NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount (NGN)" htmlFor="amount">
          <input
            id="amount"
            type="number"
            min={10}
            step={10}
            value={form.amount}
            onChange={(e) => onChange("amount", e.target.value)}
            placeholder="e.g. 500"
            className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            required
          />
        </Field>
        <Field label="Reference (Optional)" htmlFor="reference">
          <input
            id="reference"
            type="text"
            value={form.reference}
            onChange={(e) => onChange("reference", e.target.value)}
            placeholder="Auto-generated if blank"
            className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </Field>
        <div className="pt-2 flex gap-3 items-center">
          <button
            type="submit"
            disabled={disabled}
            className={classNames(
              "inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900",
              submitting
                ? "bg-neutral-400 text-white cursor-wait"
                : disabled
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-neutral-900 text-white hover:bg-neutral-800",
            )}
          >
            {submitting ? "Processing..." : "Buy Airtime"}
          </button>
          {!user && <span className="text-[10px] uppercase tracking-wide text-rose-600">Sign in required</span>}
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-xs space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Purchase Result</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <KV label="Status" value={result.status} />
            <KV label="Service" value={result.service_name} />
            <KV label="Phone" value={result.phone} />
            <KV label="Amount" value={String(result.amount)} />
            <KV label="Charged" value={result.amount_charged} />
            <KV label="Discount" value={result.discount} />
            <KV label="Initial Bal" value={result.initial_balance} />
            <KV label="Final Bal" value={result.final_balance} />
            <KV label="Request ID" value={result.request_id} />
            <KV label="Order ID" value={String(result.order_id)} />
            <KV label="Txn Ref" value={result.transactionRef} />
          </div>
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-neutral-500 max-w-prose">
        Ensure you have sufficient wallet balance. A unique request ID is generated if not provided
        to support idempotent operations.
      </p>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-[11px] font-medium uppercase tracking-wide text-neutral-600">{label}</label>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-800 break-all">{value}</span>
    </div>
  );
}
