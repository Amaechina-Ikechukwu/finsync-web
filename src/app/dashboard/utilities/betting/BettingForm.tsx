"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastProvider";
import {
  fundBettingAccount,
  verifyBettingCustomer,
  type FundBettingAccountSuccessData,
  type VerifyBettingCustomerSuccessData,
} from "@/lib/apiClient";

interface FormState {
  service_id: string;
  customer_id: string;
  amount: string; // keep as string for controlled input
}

const SERVICES = [
  { id: "Bet9ja", label: "Bet9ja" },
  { id: "BetKing", label: "BetKing" },
  { id: "SportyBet", label: "SportyBet" },
  { id: "1xBet", label: "1xBet" },
];

function classNames(...tokens: (string | false | null | undefined)[]) {
  return tokens.filter(Boolean).join(" ");
}

export function BettingForm({
  onFundSuccess,
  onVerification,
}: {
  onFundSuccess?: (data: FundBettingAccountSuccessData) => void;
  onVerification?: (status: "loading" | "success" | "error" | "idle", data?: VerifyBettingCustomerSuccessData | null) => void;
}) {
  const { user, getIdToken } = useAuth();
  const { push } = useToast();

  const [form, setForm] = useState<FormState>({
    service_id: "Bet9ja",
    customer_id: "",
    amount: "100",
  });
  const [verifying, setVerifying] = useState(false);
  const [verifiedData, setVerifiedData] = useState<VerifyBettingCustomerSuccessData | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);
  const [lastAttemptedId, setLastAttemptedId] = useState<string>("");
  const [result, setResult] = useState<FundBettingAccountSuccessData | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const disabled = !user || funding;
  const canFund = !!verifiedData && !funding && !verifying && !verifyError && form.customer_id.trim().length > 0;

  const onChange = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "customer_id" || key === "service_id") {
      // Reset verification state when identifiers change
      setVerifiedData(null);
      setVerifyError(null);
      scheduleVerify(value, key === "customer_id");
    }
  };

  const scheduleVerify = useCallback((value: string, immediate: boolean) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!form.customer_id.trim()) {
      return; // nothing to verify
    }
    const run = () => { void runVerification(); };
    if (immediate) {
      debounceRef.current = setTimeout(run, 300); // slight delay after typing stops
    } else {
      debounceRef.current = setTimeout(run, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.customer_id, form.service_id]);

  const runVerification = useCallback(async () => {
    if (!user) return;
    const cid = form.customer_id.trim();
    if (!cid) return;
    if (cid === lastAttemptedId && verifiedData) return; // already verified this id/service combo
    try {
      setVerifying(true);
      onVerification?.("loading");
      setLastAttemptedId(cid + "|" + form.service_id);
      setVerifyError(null);
      const token = await getIdToken(true);
      if (!token) throw new Error("Not authenticated");
      const data = await verifyBettingCustomer(token, {
        customer_id: cid,
        service_id: form.service_id,
      });
      setVerifiedData(data);
      onVerification?.("success", data);
      push({
        variant: "success",
        title: "Account Verified",
        description: data.customer_name ? `${data.customer_name}` : `Customer ID ${cid} valid`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setVerifyError(msg);
      setVerifiedData(null);
      onVerification?.("error");
      push({
        variant: "error",
        title: "Verification Failed",
        description: msg,
      });
    } finally {
      setVerifying(false);
    }
  }, [user, form.customer_id, form.service_id, getIdToken, push, lastAttemptedId, verifiedData, onVerification]);

  const validate = (): string | null => {
    if (!form.customer_id.trim()) return "Customer ID required";
    const amt = Number(form.amount);
    if (Number.isNaN(amt) || amt <= 0) return "Enter a valid amount > 0";
    if (!form.service_id) return "Select a service";
    if (!verifiedData) return "Verify customer first";
    return null;
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      push({ variant: "error", title: "Cannot Fund", description: err });
      return;
    }
    try {
      setFunding(true);
      onVerification?.("loading"); // show activity feed loading entry for funding
      const token = await getIdToken(true);
      if (!token) throw new Error("Not authenticated");
      const data = await fundBettingAccount(token, {
        customer_id: form.customer_id.trim(),
        service_id: form.service_id,
        amount: form.amount,
      });
      setResult(data);
      onFundSuccess?.(data);
      push({
        variant: "success",
        title: "Betting Account Funded",
        description: `${form.service_id} NGN ${data.amount}`,
      });
      // Keep verification to allow multiple funding operations; optionally clear amount
      setForm((f) => ({ ...f, amount: "" }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      push({ variant: "error", title: "Funding Failed", description: msg });
    } finally {
      setFunding(false);
      onVerification?.("idle");
    }
  };

  const verificationStatusEl = useMemo(() => {
    if (verifying) return <span className="text-xs text-amber-600">Verifying...</span>;
    if (verifyError) return <span className="text-xs text-rose-600">{verifyError}</span>;
    if (verifiedData) return <span className="text-xs text-emerald-600">Verified{verifiedData.customer_name ? `: ${verifiedData.customer_name}` : ""}</span>;
    return <span className="text-xs text-neutral-500">Enter ID to verify</span>;
  }, [verifying, verifyError, verifiedData]);

  return (
    <form onSubmit={handleFund} className="grid max-w-md gap-4 text-sm">
      <Field label="Service" htmlFor="service_id">
        <select
          id="service_id"
          value={form.service_id}
          onChange={(e) => onChange("service_id", e.target.value)}
          className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          required
        >
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Customer ID" htmlFor="customer_id">
        <input
          id="customer_id"
          type="text"
          value={form.customer_id}
          onChange={(e) => onChange("customer_id", e.target.value)}
          onBlur={() => scheduleVerify(form.customer_id, true)}
          placeholder="e.g. 23007416"
          className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          required
        />
        <div className="pt-1">{verificationStatusEl}</div>
      </Field>
      <Field label="Amount (NGN)" htmlFor="amount">
        <input
          id="amount"
          type="number"
            min={50}
          value={form.amount}
          onChange={(e) => onChange("amount", e.target.value)}
          placeholder="e.g. 1000"
          className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          required
        />
      </Field>
      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={!canFund}
          className={classNames(
            "inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900",
            funding
              ? "bg-neutral-400 text-white cursor-wait"
              : !canFund
              ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              : "bg-neutral-900 text-white hover:bg-neutral-800",
          )}
        >
          {funding ? "Funding..." : "Fund Account"}
        </button>
        {!user && (
          <span className="text-[10px] uppercase tracking-wide text-rose-600">Sign in required</span>
        )}
      </div>
      {result && (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-xs space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Last Funding</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <KV label="Service" value={result.service_id} />
            <KV label="Customer" value={result.customer_id} />
            <KV label="Amount" value={String(result.amount)} />
            {result.status && <KV label="Status" value={result.status} />}
            {result.transactionRef && <KV label="Txn Ref" value={result.transactionRef} />}
            {result.order_id && <KV label="Order ID" value={String(result.order_id)} />}
          </div>
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-neutral-500 max-w-prose">
        Customer verification happens automatically when you enter or change the customer ID or service. Funding is only enabled after a successful verification.
      </p>
    </form>
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
