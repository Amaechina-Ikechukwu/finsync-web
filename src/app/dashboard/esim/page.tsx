"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Loader from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import {
  type EsimCountryItem,
  type EsimOperatorItem,
  type EsimPackageItem,
  type EsimPurchaseItem,
  fetchEsimCountries,
  fetchEsimOperators,
  fetchEsimPackages,
  fetchEsimUserPurchases,
  purchaseEsim,
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

export default function EsimPage() {
  const { user, getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Purchases
  const [purchases, setPurchases] = useState<EsimPurchaseItem[] | null>(null);
  // Whether user is in the buying flow UI
  const [showFlow, setShowFlow] = useState(false);

  // Flow selections
  const [countries, setCountries] = useState<EsimCountryItem[] | null>(null);
  const [operators, setOperators] = useState<EsimOperatorItem[] | null>(null);
  const [packages, setPackages] = useState<EsimPackageItem[] | null>(null);

  const [selectedCountry, setSelectedCountry] =
    useState<EsimCountryItem | null>(null);
  const [selectedOperator, setSelectedOperator] =
    useState<EsimOperatorItem | null>(null);
  const [selectedPackage, setSelectedPackage] =
    useState<EsimPackageItem | null>(null);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Search queries for modals
  const [countryQuery, setCountryQuery] = useState("");
  const [operatorQuery, setOperatorQuery] = useState("");
  const [packageQuery, setPackageQuery] = useState("");

  // Step logic
  const step: 0 | 1 | 2 | 3 = useMemo(() => {
    if (!selectedCountry) return 0;
    if (!selectedOperator) return 1;
    if (!selectedPackage) return 2;
    return 3; // confirm
  }, [selectedCountry, selectedOperator, selectedPackage]);

  // Initial: load purchases. Countries are only fetched when user explicitly starts flow.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token available");
        const mine = await fetchEsimUserPurchases(token);
        if (!cancelled) setPurchases(mine);
        // Do not auto-load countries; wait for user to click Buy
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

  // When user starts the flow (via CTA), fetch countries
  useEffect(() => {
    let cancelled = false;
    const loadCountries = async () => {
      if (!user || !showFlow) return;
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) return; // no auth token available
        const cs = await fetchEsimCountries(token, { uid: user.uid });
        if (!cancelled) setCountries(cs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadCountries();
    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, showFlow]);

  // When country changes fetch operators
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user || !selectedCountry) return;
      setOperators(null);
      setPackages(null);
      setSelectedOperator(null);
      setSelectedPackage(null);
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) return;
        const countrySlug =
          selectedCountry?.slug ?? selectedCountry?.code ?? selectedCountry?.country_code ?? "";
        const ops = await fetchEsimOperators(token, String(countrySlug), {
          uid: user.uid,
        });
        if (!cancelled) setOperators(ops);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, selectedCountry]);

  // When operator changes fetch packages
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user || !selectedOperator) return;
      setPackages(null);
      setSelectedPackage(null);
      setLoading(true);
      setError("");
      try {
        const token = await getIdToken();
        if (!token) return;
        const countrySlug =
          selectedCountry?.slug || selectedCountry?.code || "";
        const p = await fetchEsimPackages(
          token,
          String(countrySlug),
          selectedOperator.id,
          { uid: user.uid },
        );
        if (!cancelled) setPackages(p);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, getIdToken, selectedOperator]);

  const handlePurchase = async () => {
    if (!user || !selectedPackage || !selectedOperator) return;
    setIsPurchasing(true);
    setError("");
    try {
      const token = await getIdToken();
      if (!token) return;
      await purchaseEsim(token, {
        packageId: selectedPackage.id,
        operatorId: selectedOperator.id,
      });
      // Refresh purchases and reset flow
      const mine = await fetchEsimUserPurchases(token);
      setPurchases(mine);
      setSelectedCountry(null);
      setSelectedOperator(null);
      setSelectedPackage(null);
      setCountries(null);
      setShowConfirmModal(false);
      setShowFlow(false);
      setOperators(null);
      setPackages(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPurchasing(false);
    }
  };

  // Extracted flow UI to avoid duplication
  const FlowSection = () => (
    <>
      <SectionCard title="Select country">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            {selectedCountry ? (
              <div className="flex items-center gap-2">
                <span>{selectedCountry.emoji ?? "🌍"}</span>
                <span className="font-medium">
                  {selectedCountry.name ?? selectedCountry.title}
                </span>
              </div>
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
                      const n = (c.name ?? c.title ?? "").toLowerCase();
                      const cc = (c.code ?? c.slug ?? c.country_code ?? "")
                        .toString()
                        .toLowerCase();
                      return n.includes(q) || cc.includes(q);
                    })
                    .map((c) => (
                      <button
                        type="button"
                        key={
                          c.code ?? c.slug ?? c.country_code ?? Math.random()
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                          (
                            selectedCountry?.code ??
                              selectedCountry?.slug ??
                              selectedCountry?.country_code
                          ) === (c.code ?? c.slug ?? c.country_code)
                            ? "border-black"
                            : "border-black/10"
                        }`}
                        onClick={() => {
                          setSelectedCountry(c);
                          setShowCountryModal(false);
                          setCountryQuery("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {c.image?.url ? (
                            <div className="relative w-8 h-6 shrink-0">
                              <Image
                                src={c.image.url}
                                alt={`${c.name ?? c.title ?? "Country"} flag`}
                                fill
                                sizes="32px"
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className="mr-1">{c.emoji ?? "🌍"}</span>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {c.name ?? c.title ?? "Country"}
                            </span>
                            {typeof c.operators_count === "number" ? (
                              <span className="text-xs text-neutral-600">
                                {c.operators_count} operators
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))}
                  {countries.filter((c) => {
                    if (!countryQuery.trim()) return true;
                    const q = countryQuery.toLowerCase();
                    const n = (c.name ?? c.title ?? "").toLowerCase();
                    const cc = (c.code ?? c.slug ?? c.country_code ?? "")
                      .toString()
                      .toLowerCase();
                    return n.includes(q) || cc.includes(q);
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

      {step >= 1 ? (
        <SectionCard title="Choose operator">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              {selectedOperator ? (
                <div className="flex flex-col">
                  <span className="font-medium">{selectedOperator.name}</span>
                  <span className="text-xs text-neutral-600">
                    {selectedCountry?.name ?? selectedCountry?.title}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-600">No operator selected</span>
              )}
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
              onClick={() => setShowOperatorModal(true)}
              disabled={loading || !operators || operators.length === 0}
            >
              {selectedOperator ? "Change" : "Select operator"}
            </button>
          </div>

          {showOperatorModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <button
                type="button"
                aria-label="Close operator modal"
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setShowOperatorModal(false);
                  setOperatorQuery("");
                }}
                disabled={loading}
              />
              <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[75vh]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Choose operator</h3>
                  <button
                    type="button"
                    className="text-sm text-neutral-700 hover:underline"
                    onClick={() => {
                      setShowOperatorModal(false);
                      setOperatorQuery("");
                    }}
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={operatorQuery}
                    onChange={(e) => setOperatorQuery(e.target.value)}
                    placeholder="Search operators…"
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                {!operators ? (
                  loading ? (
                    <div className="py-6 flex justify-center">
                      <Loader size={56} message="Loading operators" />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      No operators available.
                    </p>
                  )
                ) : operators.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    No operators for{" "}
                    {selectedCountry?.name ?? selectedCountry?.title}.
                  </p>
                ) : (
                  <div
                    className="space-y-2 overflow-y-auto pr-1"
                    style={{ maxHeight: "calc(75vh - 140px)" }}
                  >
                    {operators
                      .filter((o) => {
                        if (!operatorQuery.trim()) return true;
                        const q = operatorQuery.toLowerCase();
                        const n = (o.name ?? "").toLowerCase();
                        return n.includes(q);
                      })
                      .map((o) => (
                        <button
                          type="button"
                          key={String(o.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                            selectedOperator?.id === o.id
                              ? "border-black"
                              : "border-black/10"
                          }`}
                          onClick={() => {
                            setSelectedOperator(o);
                            setShowOperatorModal(false);
                            setOperatorQuery("");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            {o.logo_url || o.image?.url ? (
                              <div className="relative w-8 h-6 shrink-0">
                                <Image
                                  src={(o.logo_url || o.image?.url) as string}
                                  alt={`${o.name} logo`}
                                  fill
                                  sizes="32px"
                                  className="object-contain"
                                />
                              </div>
                            ) : null}
                            <div className="flex flex-col">
                              <div className="font-medium">{o.name}</div>
                              <div className="text-xs text-neutral-600">
                                {selectedCountry?.name ??
                                  selectedCountry?.title}
                                {typeof o.packages_count === "number" &&
                                o.packages_count > 0
                                  ? ` • ${o.packages_count} packages`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    {operators.filter((o) => {
                      if (!operatorQuery.trim()) return true;
                      const q = operatorQuery.toLowerCase();
                      const n = (o.name ?? "").toLowerCase();
                      return n.includes(q);
                    }).length === 0 ? (
                      <p className="text-sm text-neutral-600">
                        No operators found.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      {step >= 2 ? (
        <SectionCard title="Pick a package">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-700">
              {selectedPackage ? (
                <div className="flex flex-col">
                  <span className="font-medium">{selectedPackage.name}</span>
                  <span className="text-xs text-neutral-600">
                    {selectedOperator?.name}
                    {selectedPackage.data_amount
                      ? ` • ${selectedPackage.data_amount}`
                      : ""}
                    {selectedPackage.validity_days
                      ? ` • ${selectedPackage.validity_days} days`
                      : ""}
                  </span>
                </div>
              ) : (
                <span className="text-neutral-600">No package selected</span>
              )}
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
              onClick={() => setShowPackageModal(true)}
              disabled={loading || !packages || packages.length === 0}
            >
              {selectedPackage ? "Change" : "Select package"}
            </button>
          </div>

          {showPackageModal ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <button
                type="button"
                aria-label="Close package modal"
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  setShowPackageModal(false);
                  setPackageQuery("");
                }}
                disabled={loading}
              />
              <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[75vh]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold">Pick a package</h3>
                  <button
                    type="button"
                    className="text-sm text-neutral-700 hover:underline"
                    onClick={() => {
                      setShowPackageModal(false);
                      setPackageQuery("");
                    }}
                    disabled={loading}
                  >
                    Close
                  </button>
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    value={packageQuery}
                    onChange={(e) => setPackageQuery(e.target.value)}
                    placeholder="Search packages…"
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                {!packages ? (
                  loading ? (
                    <div className="py-6 flex justify-center">
                      <Loader size={56} message="Loading packages" />
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      No packages available.
                    </p>
                  )
                ) : packages.length === 0 ? (
                  <p className="text-sm text-neutral-600">
                    No packages for {selectedOperator?.name}.
                  </p>
                ) : (
                  <div
                    className="space-y-2 overflow-y-auto pr-1"
                    style={{ maxHeight: "calc(75vh - 140px)" }}
                  >
                    {packages
                      .filter((p) => {
                        if (!packageQuery.trim()) return true;
                        const q = packageQuery.toLowerCase();
                        const n = (p.name ?? "").toLowerCase();
                        const da = (p.data_amount ?? "")
                          .toString()
                          .toLowerCase();
                        const vd = (p.validity_days ?? "")
                          .toString()
                          .toLowerCase();
                        return (
                          n.includes(q) || da.includes(q) || vd.includes(q)
                        );
                      })
                      .map((p) => (
                        <button
                          type="button"
                          key={String(p.id)}
                          className={`w-full rounded-lg border px-3 py-2 text-left text-sm hover:bg-neutral-50 ${
                            selectedPackage?.id === p.id
                              ? "border-black"
                              : "border-black/10"
                          }`}
                          onClick={() => {
                            setSelectedPackage(p);
                            setShowPackageModal(false);
                            setPackageQuery("");
                          }}
                        >
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-neutral-600">
                            {p.data_amount ? `${p.data_amount} • ` : ""}
                            {p.validity_days ? `${p.validity_days} days` : ""}
                          </div>
                          {p.price !== undefined ? (
                            <div className="text-xs mt-1">
                              {p.currency ?? ""} {p.price}
                            </div>
                          ) : null}
                        </button>
                      ))}
                    {packages.filter((p) => {
                      if (!packageQuery.trim()) return true;
                      const q = packageQuery.toLowerCase();
                      const n = (p.name ?? "").toLowerCase();
                      const da = (p.data_amount ?? "").toString().toLowerCase();
                      const vd = (p.validity_days ?? "")
                        .toString()
                        .toLowerCase();
                      return n.includes(q) || da.includes(q) || vd.includes(q);
                    }).length === 0 ? (
                      <p className="text-sm text-neutral-600">
                        No packages found.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
            onClick={() => setShowConfirmModal(true)}
            disabled={isPurchasing}
          >
            Proceed to checkout
          </button>
          <button
            type="button"
            className="text-sm text-neutral-700 hover:underline"
            onClick={() => setSelectedPackage(null)}
          >
            Change package
          </button>
        </div>
      ) : null}

      {showConfirmModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close purchase modal"
            className="absolute inset-0 bg-black/40"
            onClick={() => !isPurchasing && setShowConfirmModal(false)}
            disabled={isPurchasing}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="text-base font-semibold mb-4">
              Confirm eSIM purchase
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                Country:{" "}
                <span className="font-medium">
                  {selectedCountry?.name ?? selectedCountry?.title}
                </span>
              </p>
              <p>
                Operator:{" "}
                <span className="font-medium">{selectedOperator?.name}</span>
              </p>
              <p>
                Package:{" "}
                <span className="font-medium">{selectedPackage?.name}</span>
              </p>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setShowConfirmModal(false)}
                disabled={isPurchasing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90 disabled:opacity-60"
                onClick={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? "Purchasing…" : "Confirm & buy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">eSIM</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Buy travel data eSIMs in minutes. Choose a country, pick an operator
          and package, then confirm your purchase.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading && !purchases ? (
        <div className="text-sm text-neutral-600">Loading…</div>
      ) : null}

      {purchases && purchases.length > 0 ? (
        <div className="space-y-6">
          <SectionCard title="Your eSIMs">
            <ul className="divide-y divide-neutral-200">
              {purchases.map((p) => (
                <li
                  key={String(p.id)}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.package_name || p.operator || p.country || "eSIM"}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {p.country || p.country_code
                        ? `${p.country ?? p.country_code} • `
                        : ""}
                      {p.status ? p.status : "purchased"}
                      {p.expires_at
                        ? ` • Expires ${new Date(p.expires_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  {p.qr_code_url ? (
                    <a
                      href={p.qr_code_url}
                      className="text-xs font-medium text-blue-700 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View QR
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white text-sm font-medium shadow hover:bg-black/90"
              onClick={() => {
                setSelectedCountry(null);
                setSelectedOperator(null);
                setSelectedPackage(null);
                setCountries(null);
                setOperators(null);
                setPackages(null);
                setShowFlow(true);
                setShowCountryModal(true);
              }}
            >
              Buy another eSIM
            </button>
          </div>

          {showFlow ? <FlowSection /> : null}
        </div>
      ) : (
        <div className="space-y-6">
          {!showFlow ? (
            <div className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 p-6">
              <div>
                <h3 className="text-sm font-medium">No eSIMs yet</h3>
                <p className="text-xs text-neutral-600">
                  Start by choosing a country to explore available operators and
                  packages.
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
                Buy eSIM
              </button>
            </div>
          ) : null}

          {showFlow ? <FlowSection /> : null}
        </div>
      )}
    </div>
  );
}
