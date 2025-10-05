"use client";

import { useEffect, useMemo, useState } from "react";
import Loader from "@/components/Loader";
import { useToast } from "@/components/toast/ToastProvider";
import {
  type VirtualNumberProductEntry,
  fetchVirtualNumberPrices,
  purchaseVirtualNumber,
} from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";

export interface ProductsModalProps {
  open: boolean;
  onClose: () => void;
  countryCode: string; // slug e.g. nigeria
  countryName?: string;
  onPurchased?: () => void; // callback to refresh purchases
}

export default function ProductsModal({
  open,
  onClose,
  countryCode,
  countryName,
  onPurchased,
}: ProductsModalProps) {
  const { getIdToken } = useAuth();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<VirtualNumberProductEntry[] | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<{
    product: string;
    operator: string;
    cost: number;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!open || !countryCode) return;
      setLoading(true);
      setProducts(null);
      try {
        const token = await getIdToken();
        if (!token) return;
        const p = await fetchVirtualNumberPrices(token, countryCode);
        if (!cancelled) setProducts(p);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        push({
          variant: "error",
          title: "Failed to load products",
          description: msg,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [open, countryCode, getIdToken, push]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products || []).filter((p) =>
      q ? p.product.toLowerCase().includes(q) : true,
    );
  }, [products, query]);

  const confirmPurchase = async () => {
    if (!pending) return;
    setIsPurchasing(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      await purchaseVirtualNumber(token, {
        country: countryCode,
        operator: pending.operator,
        product: pending.product,
      });
      push({
        variant: "success",
        title: "Number purchased",
        description: `${pending.product} • ${pending.operator}`,
      });
      setPending(null);
      onClose();
      onPurchased?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      push({ variant: "error", title: "Purchase failed", description: msg });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close products modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg max-h-[80vh]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            Products in {countryName || countryCode}
          </h3>
          <button
            type="button"
            className="text-sm text-neutral-700 hover:underline"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter products…"
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
        {!products ? (
          loading ? (
            <div className="py-10 flex justify-center">
              <Loader size={56} message="Loading products" />
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No products.</p>
          )
        ) : filtered.length === 0 ? (
          <p className="text-sm text-neutral-600">
            No products match your search.
          </p>
        ) : (
          <div
            className="space-y-3 overflow-y-auto pr-1"
            style={{ maxHeight: "calc(80vh - 160px)" }}
          >
            {filtered.map((p) => (
              <div
                key={p.product}
                className="rounded-lg border border-black/10 p-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {p.product}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {countryName || countryCode}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-700">
                    {p.offers && p.offers.length > 0 ? (
                      <span>
                        From NGN {p.offers[0].cost} ·{" "}
                        {p.offers.reduce((sum, o) => sum + (o.count || 0), 0)}{" "}
                        available
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
                {p.offers && p.offers.length > 0 ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {p.offers.map((o, idx) => {
                      const key = `${p.product}|${o.operator}|${idx}`;
                      const disabled = o.count <= 0;
                      return (
                        <button
                          type="button"
                          key={key}
                          disabled={disabled}
                          onClick={() =>
                            setPending({
                              product: p.product,
                              operator: o.operator,
                              cost: o.cost,
                            })
                          }
                          className={`rounded-md border p-3 text-left text-xs transition hover:bg-neutral-50 ${
                            disabled
                              ? "cursor-not-allowed opacity-60 border-black/10"
                              : "border-black/20"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-semibold">{o.operator}</div>
                              <div className="text-neutral-600">
                                NGN {o.cost}
                              </div>
                            </div>
                            <div className="text-neutral-600">
                              {o.count} left
                            </div>
                          </div>
                          <div className="mt-2 text-[11px] font-medium text-blue-700">
                            Buy number →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {pending ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <button
            type="button"
            aria-label="Close confirm"
            className="absolute inset-0 bg-black/50"
            onClick={() => (!isPurchasing ? setPending(null) : null)}
            disabled={isPurchasing}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h4 className="text-base font-semibold mb-2">Confirm purchase</h4>
            <p className="text-sm text-neutral-700 mb-4">
              Buy a virtual number for{" "}
              <span className="font-semibold capitalize">
                {pending.product}
              </span>{" "}
              via <span className="font-semibold">{pending.operator}</span> in{" "}
              {countryName || countryCode} for{" "}
              <span className="font-semibold">NGN {pending.cost}</span>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setPending(null)}
                disabled={isPurchasing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
                onClick={confirmPurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? "Processing…" : "Confirm purchase"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
