"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/format";

// Data plan response types (simplified from example payload)
export interface DataPlanItem {
  variation_id: number;
  service_name: string;
  service_id: string; // e.g. mtn
  data_plan: string;
  price: string; // returned as string per sample
  availability: string; // Available | Unavailable
}

interface DataPlanApiResponse {
  code: string; // "success"
  message: string; // e.g. "Mtn Variations Retrieved"
  product: string; // "Data"
  data: DataPlanItem[];
}

// Supported network metadata (extend as needed)
const NETWORKS: { id: string; label: string }[] = [
  { id: "mtn", label: "MTN" },
  { id: "airtel", label: "Airtel" },
  { id: "glo", label: "Glo" },
  { id: "9mobile", label: "9mobile" },
];

function classNames(...tokens: (false | null | undefined | string)[]) {
  return tokens.filter(Boolean).join(" ");
}

function useDataPlans(network: string | null) {
  const { getIdToken, user } = useAuth();
  const [data, setData] = useState<DataPlanItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedNetwork, setFetchedNetwork] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!network) return;
      if (!user) return; // wait for auth
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken(true);
        if (!token) throw new Error("Missing auth token");
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/u, "") || "";
        if (!base) throw new Error("API base not configured");
        const res = await fetch(`${base}/vtu/data-plans/${network}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed (${res.status}) ${text}`);
        }
        const json = (await res.json()) as DataPlanApiResponse;
        if (!cancelled) {
          setData(json.data);
          setFetchedNetwork(network);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [network, user, getIdToken]);

  return { data, loading, error, fetchedNetwork };
}

function AvailabilityBadge({ status }: { status: string }) {
  const ok = /available/i.test(status);
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        ok
          ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20"
          : "bg-rose-100 text-rose-700 ring-1 ring-rose-500/20",
      )}
    >
      {status}
    </span>
  );
}

function DataPlansTable({ plans }: { plans: DataPlanItem[] }) {
  // Basic grouping by plan duration if present (e.g. "30 Days")
  const groups = useMemo(() => {
    const map = new Map<string, DataPlanItem[]>();
    for (const p of plans) {
      const match = p.data_plan.match(/(\d+\s*Days?)/i);
      const key = match ? match[1].toLowerCase() : "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // Sort groups by numeric days where possible
    return Array.from(map.entries()).sort((a, b) => {
      const getDays = (k: string) => parseInt(k, 10) || 0;
      return getDays(a[0]) - getDays(b[0]);
    });
  }, [plans]);

  return (
    <div className="space-y-6">
      {groups.map(([group, items]) => (
        <div key={group} className="space-y-2">
          <h4 className="text-xs font-semibold tracking-wide uppercase text-neutral-500">
            {group === "other" ? "Misc" : group}
          </h4>
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white/60 backdrop-blur">
            <table className="min-w-full divide-y divide-black/5 text-sm">
              <thead className="bg-neutral-50/50 text-[11px] uppercase tracking-wide text-neutral-600">
                <tr>
                  <th className="py-2 pl-4 pr-2 text-left font-medium">Plan</th>
                  <th className="px-2 py-2 text-left font-medium">Price</th>
                  <th className="px-2 py-2 text-left font-medium">Status</th>
                  <th className="px-2 py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((p) => {
                  const priceNumber = Number(p.price);
                  return (
                    <tr key={p.variation_id} className="hover:bg-neutral-50/70">
                      <td className="py-2 pl-4 pr-2 align-top font-medium text-neutral-800">
                        <div className="flex flex-col">
                          <span>{p.data_plan}</span>
                          <span className="text-[10px] text-neutral-500">ID: {p.variation_id}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 align-top whitespace-nowrap text-neutral-700">
                        {isNaN(priceNumber)
                          ? p.price
                          : formatCurrency(priceNumber, "NGN", "en-NG")}
                      </td>
                      <td className="px-2 py-2 align-top"><AvailabilityBadge status={p.availability} /></td>
                      <td className="px-2 py-2 align-top text-right">
                        <button
                          type="button"
                          disabled={!/available/i.test(p.availability)}
                          className={classNames(
                            "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed",
                            /available/i.test(p.availability)
                              ? "bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900"
                              : "bg-neutral-200 text-neutral-500 border-neutral-300",
                          )}
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DataPlansExplorer() {
  const [network, setNetwork] = useState<string | null>("mtn");
  const { data, loading, error, fetchedNetwork } = useDataPlans(network);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-neutral-600">
            Network
          </label>
          <select
            className="w-48 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            value={network ?? ""}
            onChange={(e) => setNetwork(e.target.value || null)}
          >
            {NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-[11px] text-neutral-500 max-w-md leading-relaxed">
          Select a network to load available data bundles. Pricing and availability are
          fetched live from the VTU provider API.
        </p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/70 p-4 min-h-[140px] relative overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-xs text-neutral-600">
            <div className="relative h-10 w-10">
              <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-500 via-amber-500 to-emerald-500 opacity-20 blur" />
              <span className="absolute inset-0 animate-pulse rounded-full border-2 border-dashed border-neutral-300" />
              <span className="absolute inset-1 animate-[spin_6s_linear_infinite] rounded-full border border-neutral-300/40" />
            </div>
            <span className="tracking-wide uppercase font-medium text-[10px]">Loading {network?.toUpperCase()} Plans</span>
            <span className="h-1 w-32 overflow-hidden rounded-full bg-neutral-200">
              <span className="block h-full w-1/2 animate-[loader-slide_1.2s_ease_infinite] rounded-full bg-gradient-to-r from-neutral-400 via-neutral-700 to-neutral-400" />
            </span>
            <style jsx>{`
              @keyframes loader-slide { 0% { transform: translateX(-100%);} 50% { transform: translateX(0);} 100% { transform: translateX(100%);} }
            `}</style>
          </div>
        )}
        {!loading && error && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-rose-600">{error}</p>
            <button
              type="button"
              onClick={() => setNetwork((n) => (n ? `${n}` : n))}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && data && data.length === 0 && (
          <p className="text-xs text-neutral-500">No plans returned.</p>
        )}
        {!loading && !error && data && data.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">
                {data.length > 0 && (NETWORKS.find((n) => n.id === fetchedNetwork)?.label || fetchedNetwork?.toUpperCase())} Data Plans
              </h3>
              <span className="text-[10px] uppercase tracking-wide text-neutral-500">
                {data.length} plans
              </span>
            </div>
            <DataPlansTable plans={data} />
          </div>
        )}
      </div>
    </div>
  );
}
