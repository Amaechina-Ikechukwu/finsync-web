"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchCableVariations, subscribeCable, verifyCableCustomer, type CableVariationItem, type SubscribeCableSuccessData, type VerifyCableSuccessData } from "@/lib/apiClient";
import { useToast } from "@/components/toast/ToastProvider";

interface FormState {
  customer_id: string; // smartcard / IUC number
  service_id: string; // gotv, dstv, startimes etc.
  variation_id: number | ""; // plan id
  reference: string; // optional idempotent ref
}

const SERVICES = [
  { id: "gotv", label: "GOtv" },
  { id: "dstv", label: "DStv" },
  { id: "startimes", label: "StarTimes" },
  { id: "showmax", label: "Showmax" },
  // add more as backend supports
];

function classNames(...tokens: (string | false | null | undefined)[]) {
  return tokens.filter(Boolean).join(" ");
}

export function CableSubscriptionForm() {
  const { user, getIdToken } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState<FormState>({
    customer_id: "",
    service_id: SERVICES[0].id,
    variation_id: "",
    reference: "",
  });
  const [plans, setPlans] = useState<CableVariationItem[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubscribeCableSuccessData | null>(null);
  const [verification, setVerification] = useState<VerifyCableSuccessData | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const disabled = submitting || !user || !form.variation_id || !verification;

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // Fetch variations whenever service changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPlans(null);
      setPlansError(null);
      setForm((f) => ({ ...f, variation_id: "" }));
      setVerification(null);
      setVerifyError(null);
      try {
        setLoadingPlans(true);
        const token = await getIdToken(true);
        if (!token) throw new Error("Not authenticated");
        const data = await fetchCableVariations(token, form.service_id, { customer_id: form.customer_id || undefined });
        if (!cancelled) setPlans(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setPlansError(msg);
        push({ variant: "error", title: "Load Plans Failed", description: msg });
      } finally {
        if (!cancelled) setLoadingPlans(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.service_id]);

  // Debounced verification when customer_id or service changes
  useEffect(() => {
    setVerification(null);
    setVerifyError(null);
    if (!form.customer_id || form.customer_id.trim().length < 6) return; // basic length check
    if (!form.service_id) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        setVerifying(true);
        const token = await getIdToken(true);
        if (!token) throw new Error("Not authenticated");
        const data = await verifyCableCustomer(token, { customer_id: form.customer_id.trim(), service_id: form.service_id });
        if (!cancelled) {
          setVerification(data);
          push({ variant: "success", title: "Customer Verified", description: String((data as any).customer_name || data.customer_id), durationMs: 3000 });
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
    return () => { cancelled = true; clearTimeout(handle); };
  }, [form.customer_id, form.service_id, getIdToken, push]);

  const currentPlan = plans?.find((p) => p.variation_id === form.variation_id);

  const validate = () => {
    if (!form.customer_id.trim() || form.customer_id.length < 6) return "Enter a valid smartcard / IUC number";
    if (!form.service_id) return "Select a service";
    if (!form.variation_id) return "Select a plan";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const v = validate();
    if (v) {
      push({ variant: "error", title: "Validation Error", description: v });
      return;
    }
    if (!verification) {
      push({ variant: "error", title: "Verification Required", description: "Customer must be verified before subscription." });
      return;
    }
    try {
      setSubmitting(true);
      const token = await getIdToken(true);
      if (!token) throw new Error("Not authenticated");
      const payload = {
        customer_id: verification.customer_id || form.customer_id.trim(),
        service_id: form.service_id,
        variation_id: Number(form.variation_id),
        request_id: form.reference.trim() || `req_${Date.now()}`,
      };
      const data = await subscribeCable(token, payload);
      setResult(data);
      push({ variant: "success", title: "Subscription Successful", description: `${form.service_id.toUpperCase()} ${currentPlan?.package_bouquet || "Plan"} for ${form.customer_id}` });
      setForm((f) => ({ ...f, reference: "" }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      push({ variant: "error", title: "Subscription Failed", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid max-w-lg gap-4 text-sm">
        <Field label="Smartcard / IUC Number" htmlFor="customer_id">
          <input id="customer_id" value={form.customer_id} onChange={(e) => onChange("customer_id", e.target.value)} placeholder="e.g. 7035295352" required className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </Field>
        <Field label="Service" htmlFor="service_id">
          <select id="service_id" value={form.service_id} onChange={(e) => onChange("service_id", e.target.value)} className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" required>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Plan" htmlFor="variation_id">
          {loadingPlans ? (
            <div className="text-[11px] text-neutral-500 flex items-center gap-2"><Spinner size={14} /> Loading plans…</div>
          ) : plansError ? (
            <div className="text-[11px] text-rose-600">{plansError}</div>
          ) : (
            <select id="variation_id" value={form.variation_id} onChange={(e) => onChange("variation_id", e.target.value ? Number(e.target.value) : "")} className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" required>
              <option value="" disabled>Select a plan</option>
              {plans?.map((p) => (
                <option key={p.variation_id} value={p.variation_id}>{p.package_bouquet} — NGN {p.price}</option>
              ))}
            </select>
          )}
        </Field>
        {currentPlan && (
          <div className="rounded-lg border border-black/10 bg-white/70 p-3 text-[11px] space-y-1">
            <div className="flex justify-between"><span className="uppercase tracking-wide text-neutral-500">Selected Plan</span><span className="font-medium text-neutral-800">{currentPlan.package_bouquet}</span></div>
            <div className="flex justify-between"><span className="uppercase tracking-wide text-neutral-500">Price</span><span className="font-semibold text-neutral-900">NGN {currentPlan.price}</span></div>
            {currentPlan.discount_percentage && (<div className="flex justify-between"><span className="uppercase tracking-wide text-neutral-500">Discount</span><span>{currentPlan.discount_percentage}</span></div>)}
          </div>
        )}
        <Field label="Reference (Optional)" htmlFor="reference">
          <input id="reference" value={form.reference} onChange={(e) => onChange("reference", e.target.value)} placeholder="Auto-generated if blank" className="rounded-lg border border-black/10 bg-white/80 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" />
        </Field>
        <VerificationStatus verifying={verifying} verification={verification} error={verifyError} smartcard={form.customer_id} />
        <div className="pt-2 flex items-center gap-3">
          <button type="submit" disabled={disabled} className={classNames("inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900", submitting ? "bg-neutral-400 text-white cursor-wait" : disabled ? "bg-neutral-300 text-neutral-500 cursor-not-allowed" : "bg-neutral-900 text-white hover:bg-neutral-800")}>{submitting ? "Processing..." : "Subscribe"}</button>
          {!user && <span className="text-[10px] uppercase tracking-wide text-rose-600">Sign in required</span>}
          {plans && plans.length === 0 && <span className="text-[10px] text-neutral-500">No plans available.</span>}
          {!verification && form.customer_id && !verifying && !verifyError && <span className="text-[10px] text-neutral-500">Awaiting verification…</span>}
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-black/10 bg-white/70 p-4 text-xs space-y-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">Subscription Result</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <KV label="Status" value={String(result.status || "—")} />
            <KV label="Service" value={String(result.service_name || form.service_id)} />
            <KV label="Card" value={form.customer_id} />
            {currentPlan && <KV label="Plan" value={currentPlan.package_bouquet} />}
            {currentPlan && <KV label="Price" value={`NGN ${currentPlan.price}`} />}
            {result.transactionRef && <KV label="Txn Ref" value={result.transactionRef} />}
            {result.request_id && <KV label="Request ID" value={result.request_id} />}
          </div>
        </div>
      )}
      <p className="text-[10px] leading-relaxed text-neutral-500 max-w-prose">Ensure sufficient wallet balance. Customer verification retrieves the account holder name and renewal amount (if provided) and is required before subscribing.</p>
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

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function VerificationStatus({ verifying, verification, error, smartcard }: { verifying: boolean; verification: VerifyCableSuccessData | null; error: string | null; smartcard: string; }) {
  if (verifying) {
    return <div className="flex items-center gap-2 text-[11px] text-neutral-600"><Spinner size={12} /> <span>Verifying customer…</span></div>;
  }
  if (error) {
    return <div className="text-[11px] text-rose-600 flex items-center gap-1">⚠️ <span>{error.length > 70 ? error.slice(0, 70) + "…" : error}</span></div>;
  }
  if (verification) {
    return (
      <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700 space-y-1">
        <div className="flex justify-between gap-4"><span className="font-medium">Verified</span><span className="text-emerald-600/80">{verification.customer_name || smartcard}</span></div>
        {verification.current_bouquet && <div className="flex justify-between"><span className="uppercase tracking-wide text-emerald-600/60">Current</span><span>{verification.current_bouquet}</span></div>}
        {verification.renewal_amount && <div className="flex justify-between"><span className="uppercase tracking-wide text-emerald-600/60">Renewal</span><span>NGN {verification.renewal_amount}</span></div>}
      </div>
    );
  }
  return null;
}
