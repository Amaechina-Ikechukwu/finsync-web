"use client";

import { useEffect, useMemo, useState } from "react";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import ProductsModal from "./ProductsModal";
import {
  type VirtualNumberCountryItem,
  type VirtualNumberPurchaseItem,
  type VirtualNumberSmsMessage,
  fetchVirtualNumberCountries,
  fetchVirtualNumberPrices,
  fetchVirtualNumberPurchases,
  fetchVirtualNumberSms,
} from "@/lib/apiClient";

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function VirtualNumbersPage() {
  const { user, getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Purchases and SMS
  const [purchases, setPurchases] = useState<
    VirtualNumberPurchaseItem[] | null
  >(null);
  const [smsModalFor, setSmsModalFor] =
    useState<VirtualNumberPurchaseItem | null>(null);
  const [smsMessages, setSmsMessages] = useState<
    VirtualNumberSmsMessage[] | null
  >(null);
  const [smsLoading, setSmsLoading] = useState(false);

  // Flow state
  const [showFlow, setShowFlow] = useState(false);
  const [countries, setCountries] = useState<VirtualNumberCountryItem[] | null>(
    null,
  );
  const [selectedCountry, setSelectedCountry] =
    useState<VirtualNumberCountryItem | null>(null);
  // Prices are fetched within the ProductsModal

  // Modals
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);

  // Search
  const [countryQuery, setCountryQuery] = useState("");
  // Product text filter moved inside modal

  // Derived counts
  const totalNumbers = useMemo(
    () => (purchases ? purchases.length : 0),
    [purchases],
  );
  const totalRegions = useMemo(
    () => (countries ? countries.length : 0),
    [countries],
  );

  // Initial: load purchases
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const history = await fetchVirtualNumberPurchases(token);
        if (!cancelled) setPurchases(history);
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
  }, [user, getIdToken]);

  // When starting flow, load countries
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user || !showFlow) return;
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) return;
        const cs = await fetchVirtualNumberCountries(token);
        if (!cancelled) setCountries(cs);
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
  }, [user, getIdToken, showFlow]);

  // When country selected, fetch prices and open products modal
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user || !selectedCountry) return;
      // Let modal handle prices list, but prefetch once for faster UX if desired
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) return;
        await fetchVirtualNumberPrices(
          token,
          selectedCountry.code || selectedCountry.iso,
        );
        if (!cancelled) setShowProductsModal(true);
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
  }, [user, getIdToken, selectedCountry]);

  // Load SMS for a purchase when modal opens
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user || !smsModalFor) return;
      setSmsLoading(true);
      setSmsMessages(null);
      try {
        const token = await getIdToken();
        if (!token) return;
        const sms = await fetchVirtualNumberSms(
          token,
          smsModalFor.activationId,
        );
        if (!cancelled) setSmsMessages(sms);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setSmsLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, smsModalFor]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">
          Virtual Numbers
        </h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Buy and manage disposable virtual phone numbers for OTP/SMS
          verifications in many countries.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { t: "Numbers", v: totalNumbers.toString() },
          { t: "Regions", v: totalRegions ? String(totalRegions) : "—" },
          {
            t: "Awaiting SMS",
            v: purchases
              ? String(
                  purchases.filter(
                    (p) => (p.status || "").toUpperCase() !== "RECEIVED",
                  ).length,
                )
              : "—",
          },
        ].map(({ t, v }) => (
          <div
            key={t}
            className="rounded-xl border border-black/10 bg-white/70 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t}
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90"
          onClick={() => {
            setShowFlow(true);
            setShowCountryModal(true);
          }}
        >
          Buy new number
        </button>
      </div>
      {purchases && purchases.length > 0 ? (
        <SectionCard title="Your Purchases">
          <ul className="divide-y divide-neutral-200">
            {purchases.map((p) => (
              <li
                key={String(p.activationId)}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {p.product || "Virtual Number"}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {p.phone ? `${p.phone} • ` : ""}
                    {(p.country || "").toUpperCase()}
                    {p.status ? ` • ${p.status}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-xs font-medium text-blue-700 hover:underline"
                    onClick={() => setSmsModalFor(p)}
                  >
                    View SMS
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {!showFlow ? (
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-6">
              <div>
                <h3 className="text-sm font-medium">No purchases yet</h3>
                <p className="text-xs text-neutral-600">
                  Select a country to explore available products and pricing.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90"
                onClick={() => {
                  setShowFlow(true);
                  setShowCountryModal(true);
                }}
              >
                Browse numbers
              </button>
            </div>
          ) : null}
        </div>
      )}

      {showFlow ? (
        <>
          <SectionCard title="Select country">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-700">
                {selectedCountry ? (
                  <span className="font-medium">{selectedCountry.name}</span>
                ) : (
                  <span className="text-neutral-600">No country selected</span>
                )}
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
                onClick={() => setShowCountryModal(true)}
                disabled={loading}
              >
                {selectedCountry ? "Change" : "Select country"}
              </button>
            </div>

            {showCountryModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <button
                  type="button"
                  aria-label="Close country modal"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => {
                    setShowCountryModal(false);
                    setCountryQuery("");
                  }}
                  disabled={loading}
                />
                <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[75vh]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold">Select country</h3>
                    <button
                      type="button"
                      className="text-sm text-neutral-700 hover:underline"
                      onClick={() => {
                        setShowCountryModal(false);
                        setCountryQuery("");
                      }}
                      disabled={loading}
                    >
                      Close
                    </button>
                  </div>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={countryQuery}
                      onChange={(e) => setCountryQuery(e.target.value)}
                      placeholder="Search countries…"
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                  {!countries ? (
                    loading ? (
                      <div className="py-6 flex justify-center">
                        <Loader size={56} message="Loading countries" />
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-600">
                        No countries available.
                      </p>
                    )
                  ) : (
                    <div
                      className="space-y-2 overflow-y-auto pr-1"
                      style={{ maxHeight: "calc(75vh - 140px)" }}
                    >
                      {countries
                        .filter((c) => {
                          if (!countryQuery.trim()) return true;
                          const q = countryQuery.toLowerCase();
                          return (
                            (c.name || c.text_en || "")
                              .toLowerCase()
                              .includes(q) ||
                            (c.code || c.iso || "").toLowerCase().includes(q)
                          );
                        })
                        .map((c) => (
                          <button
                            type="button"
                            key={c.iso}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                              (
                                selectedCountry?.iso || selectedCountry?.code
                              ) === (c.iso || c.code)
                                ? "border-black"
                                : "border-black/10"
                            }`}
                            onClick={() => {
                              setSelectedCountry(c);
                              setShowCountryModal(false);
                              setCountryQuery("");
                            }}
                          >
                            <div className="font-medium">
                              {c.name || c.text_en}
                            </div>
                          </button>
                        ))}
                      {countries.filter((c) => {
                        if (!countryQuery.trim()) return true;
                        const q = countryQuery.toLowerCase();
                        return (
                          (c.name || c.text_en || "")
                            .toLowerCase()
                            .includes(q) ||
                          (c.code || c.iso || "").toLowerCase().includes(q)
                        );
                      }).length === 0 ? (
                        <p className="text-sm text-neutral-600">
                          No countries found.
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </SectionCard>

          {selectedCountry ? (
            <SectionCard title="Available products">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-700">
                  Products are shown in a modal for {selectedCountry.name}.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
                  onClick={() => setShowProductsModal(true)}
                  disabled={loading}
                >
                  View products
                </button>
              </div>
            </SectionCard>
          ) : null}
        </>
      ) : null}

      {smsModalFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close SMS modal"
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setSmsModalFor(null);
              setSmsMessages(null);
            }}
            disabled={smsLoading}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">
                SMS for {smsModalFor.phone}
              </h3>
              <button
                type="button"
                className="text-sm text-neutral-700 hover:underline"
                onClick={() => {
                  setSmsModalFor(null);
                  setSmsMessages(null);
                }}
                disabled={smsLoading}
              >
                Close
              </button>
            </div>
            {!smsMessages ? (
              <div className="py-10 flex justify-center">
                <Loader size={56} message="Loading SMS" />
              </div>
            ) : smsMessages.length === 0 ? (
              <p className="text-sm text-neutral-600">No SMS yet.</p>
            ) : (
              <div
                className="space-y-2 overflow-y-auto pr-1"
                style={{ maxHeight: "calc(80vh - 120px)" }}
              >
                {smsMessages.map((m, i) => (
                  <div
                    key={`${m.date || m.created_at || i}`}
                    className="rounded-md border border-black/10 p-3 text-sm"
                  >
                    <div className="text-xs text-neutral-600">
                      {m.sender || "Sender"} •{" "}
                      {m.date
                        ? new Date(m.date).toLocaleString()
                        : m.created_at
                          ? new Date(m.created_at).toLocaleString()
                          : ""}
                    </div>
                    <div className="mt-1 font-medium">{m.text || ""}</div>
                    {m.code ? (
                      <div className="mt-1 inline-flex items-center rounded bg-black/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white">
                        Code: {m.code}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {loading && !purchases ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : null}

      <ProductsModal
        open={!!showProductsModal && !!selectedCountry}
        onClose={() => setShowProductsModal(false)}
        countryCode={selectedCountry?.code || selectedCountry?.iso || ""}
        countryName={selectedCountry?.name || selectedCountry?.text_en}
        onPurchased={async () => {
          try {
            const token = await getIdToken();
            if (!token) return;
            const history = await fetchVirtualNumberPurchases(token);
            setPurchases(history);
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}
