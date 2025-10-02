"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { buyElectricity, type BuyElectricitySuccessData, verifyElectricMeter, type VerifyElectricitySuccessData } from "@/lib/apiClient";
import { useToast } from "@/components/toast/ToastProvider";

interface FormState {
  customer_id: string;
  service_id: string;
  variation_id: string;
  amount: string;
  reference: string;
}

// Full DisCo list provided
const SERVICES = [
  { id: "ikeja-electric", label: "Ikeja Electric" },
  { id: "eko-electric", label: "Eko Electric" },
  { id: "kano-electric", label: "Kano Electric" },
  { id: "portharcourt-electric", label: "Port Harcourt Electric" },
  { id: "jos-electric", label: "Jos Electric" },
  { id: "ibadan-electric", label: "Ibadan Electric" },
  { id: "kaduna-electric", label: "Kaduna Electric" },
  { id: "abuja-electric", label: "Abuja Electric" },
  { id: "enugu-electric", label: "Enugu Electric" },
  { id: "benin-electric", label: "Benin Electric" },
  { id: "aba-electric", label: "Aba Electric" },
  { id: "yola-electric", label: "Yola Electric" },
];

const VARIATIONS = [
  { id: "prepaid", label: "Prepaid" },
  { id: "postpaid", label: "Postpaid" },
];

function classNames(...tokens: (false | null | undefined | string)[]) {
  return tokens.filter(Boolean).join(" ");
}

export function ElectricityPurchaseForm() {
  const { getIdToken, user } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState<FormState>({
    customer_id: "",
    service_id: SERVICES[0].id,
    variation_id: VARIATIONS[0].id,
    amount: "1000",
    reference: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BuyElectricitySuccessData | null>(null);
  const [verification, setVerification] = useState<VerifyElectricitySuccessData | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const isPrepaid = form.variation_id === "prepaid";
  const disabled = submitting || !user || (isPrepaid && !verification);

  const onChange = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.customer_id || form.customer_id.length < 6) return "Enter a valid meter / account number";
    const amt = Number(form.amount);
    if (Number.isNaN(amt)) return "Enter a valid amount";
    const min = verification?.min_purchase_amount ?? 500;
    if (amt < min) return `Minimum amount is ${min}`;
    if (verification?.max_purchase_amount && amt > verification.max_purchase_amount) return `Maximum amount is ${verification.max_purchase_amount}`;
    if (!form.service_id) return "Select a service";
    if (!form.variation_id) return "Select a variation";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    // enforce verification for prepaid
    if (isPrepaid && !verification) {
      push({ variant: "error", title: "Verification Required", description: "Meter must be verified before purchase." });
      return;
    }
    const v = validate();
    if (v) {
      push({ variant: "error", title: "Validation Error", description: v });
      return;
    }
    try {
      setSubmitting(true);
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");
      const request_id = form.reference.trim() || `req_${Date.now()}`;
      const payload = {
        customer_id: form.customer_id.trim(),
        service_id: form.service_id,
        variation_id: form.variation_id,
        amount: Number(form.amount),
        request_id,
      };
      const data = await buyElectricity(token, payload);
      setResult(data);
      push({
        variant: "success",
        title: "Electricity Purchase",
        description: `${form.variation_id} ${form.amount} NGN for ${form.customer_id}`,
      });
  setForm((f) => ({ ...f, reference: "" }));
  if (isPrepaid) setVerification(null); // re-verify if user changes meter later
    } catch (e) {
      push({
        variant: "error",
        title: "Purchase Failed",
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Auto verification effect (debounced)
  useEffect(() => {
    // reset states when key fields change
    setVerification(null);
    setVerifyError(null);
    if (!isPrepaid) return; // only for prepaid
    if (!form.customer_id || form.customer_id.trim().length < 6) return;
    if (!form.service_id) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setVerifying(true);
        const token = await getIdToken();
        if (!token) throw new Error("Not authenticated");
        const data = await verifyElectricMeter(token, {
          customer_id: form.customer_id.trim(),
          service_id: form.service_id,
          variation_id: form.variation_id,
        });
        if (!cancelled) {
          setVerification(data);
          push({
            variant: "success",
            title: "Meter Verified",
            description: String((data as any).customer_name || data.customer_id),
            durationMs: 3000,
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) {
          setVerifyError(msg);
          push({ variant: "error", title: "Verification Failed", description: msg });
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [form.customer_id, form.service_id, form.variation_id, getIdToken, isPrepaid]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid max-w-lg gap-4 text-sm">
        <Field label="Meter / Account Number" htmlFor="customer_id">
          <input id="customer_id" value={form.customer_id} onChange={(e) => onChange("customer_id", e.target.value)} placeholder="e.g. 45022258706" required className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </Field>
        <Field label="DisCo (Service)" htmlFor="service_id">
          <select id="service_id" value={form.service_id} onChange={(e) => onChange("service_id", e.target.value)} className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" required>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Type" htmlFor="variation_id">
          <select id="variation_id" value={form.variation_id} onChange={(e) => onChange("variation_id", e.target.value)} className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" required>
            {VARIATIONS.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
        </Field>
        <Field label={`Amount (NGN)${verification?.min_purchase_amount ? ` (Min ${verification.min_purchase_amount}${verification.max_purchase_amount ? ` / Max ${verification.max_purchase_amount}` : ""})` : ""}`} htmlFor="amount">
          <input id="amount" type="number" min={verification?.min_purchase_amount ?? 500} step={100} value={form.amount} onChange={(e) => onChange("amount", e.target.value)} onBlur={() => {
            if (!verification) return;
            const amt = Number(form.amount);
            let next = amt;
            if (verification.min_purchase_amount && amt < verification.min_purchase_amount) next = verification.min_purchase_amount;
            if (verification.max_purchase_amount && amt > verification.max_purchase_amount) next = verification.max_purchase_amount;
            if (next !== amt) {
              setForm((f) => ({ ...f, amount: String(next) }));
              push({ variant: "info", title: "Amount Adjusted", description: `Clamped to ${next} based on limits.` });
            }
          }} placeholder="e.g. 2000" required className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </Field>
        <Field label="Reference (Optional)" htmlFor="reference">
          <input id="reference" value={form.reference} onChange={(e) => onChange("reference", e.target.value)} placeholder="Auto-generated if blank" className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </Field>
        <div className="pt-2 flex flex-col gap-2">
          {isPrepaid && (
            <VerificationStatus verifying={verifying} verification={verification} error={verifyError} meter={form.customer_id} />
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={disabled} className={classNames("inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900", submitting ? "bg-neutral-400 text-white cursor-wait" : disabled ? "bg-neutral-300 text-neutral-500 cursor-not-allowed" : "bg-neutral-900 text-white hover:bg-neutral-800")}>{submitting ? "Processing..." : "Buy Electricity"}</button>
            {!user && <span className="text-[10px] uppercase tracking-wide text-rose-600">Sign in required</span>}
            {isPrepaid && !verification && form.customer_id && !verifying && !verifyError && (
              <span className="text-[10px] text-neutral-500">Awaiting verification…</span>
            )}
          </div>
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-xs space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Purchase Result</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <KV label="Status" value={String(result.status || "—")} />
            <KV label="Service" value={String(result.service_name || form.service_id)} />
            <KV label="Meter" value={form.customer_id} />
            <KV label="Amount" value={String(result.amount ?? form.amount)} />
            {result.token && <KV label="Token" value={result.token} />}
            {result.units && <KV label="Units" value={String(result.units)} />}
            {result.transactionRef && <KV label="Txn Ref" value={result.transactionRef} />}
            {result.request_id && <KV label="Request ID" value={result.request_id} />}
          </div>
          {result.token && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(result.token || ""); push({ variant: "info", title: "Token Copied", description: result.token }); }}
                className="inline-flex items-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
              >Copy Token</button>
              <span className="text-[10px] text-neutral-500">Store this token safely.</span>
            </div>
          )}
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-neutral-500 max-w-prose">For prepaid meters, token and units appear when the vend succeeds. For insufficient balance errors, you will see a detailed required amount in the toast message.</p>
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

function VerificationStatus({ verifying, verification, error, meter }: { verifying: boolean; verification: VerifyElectricitySuccessData | null; error: string | null; meter: string; }) {
  if (verifying) {
    return <div className="inline-flex items-center gap-2 text-[11px] text-neutral-600"><Spinner size={12} /> <span>Verifying meter…</span></div>;
  }
  if (error) {
    return <div className="inline-flex items-center gap-1 text-[11px] text-rose-600">⚠️ <span>{error.length > 60 ? error.slice(0, 60) + "…" : error}</span></div>;
  }
  if (verification) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 border border-emerald-200">
        <span className="font-medium">Verified</span>
        <span className="text-emerald-600/70">{String((verification as any).customer_name ?? verification.name ?? meter)}</span>
      </div>
    );
  }
  return null;
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
