"use client";
import { useState } from "react";
import { useDollarCardDetails, useNairaCardDetails } from "@/lib/apiClient";
import AppButton from "@/components/AppButton";

function maskPan(pan?: string, show?: boolean) {
  if (!pan) return "•••• •••• •••• ••••";
  if (show) return pan.replace(/(.{4})/g, "$1 ").trim();
  const last4 = pan.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

function maskCVV(cvv?: string, show?: boolean) {
  if (!cvv) return "•••";
  return show ? cvv : "•••";
}

export default function UserCards() {
  const { card: dollarCard, loading: loadingDollar, error: errorDollar } =
    useDollarCardDetails();
  const { card: nairaCard, loading: loadingNaira, error: errorNaira } =
    useNairaCardDetails();

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 sm:col-span-2 lg:col-span-2">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
        Cards
      </h3>
  <div className="grid gap-6 md:grid-cols-2 auto-rows-fr">
        <CardSection
          label="Dollar Card"
          loading={loadingDollar}
          error={errorDollar}
          data={dollarCard && {
            holder: dollarCard.card_holder_name,
            brand: dollarCard.card_brand,
            pan: dollarCard.card_number,
            cvv: dollarCard.cvv,
            expiry: dollarCard.expiry,
            balance: dollarCard.balance,
          }}
          emptyCtaLabel="Apply for Dollar Card"
        />
        <CardSection
          label="Naira Card"
          loading={loadingNaira}
          error={errorNaira}
          data={nairaCard && {
            holder: nairaCard.customer_name,
            brand: nairaCard.card_brand,
            pan: nairaCard.card_number,
            cvv: nairaCard.cvv,
            expiry: nairaCard
              ? `${nairaCard.expiry_month}/${nairaCard.expiry_year.slice(-2)}`
              : undefined,
          }}
          emptyCtaLabel="Apply for Naira Card"
        />
      </div>
    </div>
  );
}

interface CardSectionData {
  holder?: string;
  brand?: string;
  pan?: string;
  cvv?: string;
  expiry?: string;
  balance?: number;
}
interface CardSectionProps {
  label: string;
  loading: boolean;
  error: string | null;
  data?: CardSectionData | null;
  emptyCtaLabel: string;
}

function CardSection({ label, loading, error, data, emptyCtaLabel }: CardSectionProps) {
  const [showPan, setShowPan] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  return (
    <div className="flex flex-col rounded-xl border border-black/10 bg-white/80 p-6 shadow-sm min-h-[210px] md:min-h-[230px]">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm md:text-base font-semibold text-neutral-800 tracking-tight">{label}</h4>
      </div>
      {loading && <p className="mt-3 text-xs text-neutral-500">Loading...</p>}
      {error && !/No\s+.*card\s+found/i.test(error) && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}
      {!loading && (!data || !data.pan) && (
        <div className="mt-3 flex flex-col gap-3 text-xs text-neutral-600">
          <p>No card yet.</p>
          <div>
            <AppButton size="xs" variant="subtle" type="button">
              {emptyCtaLabel}
            </AppButton>
          </div>
        </div>
      )}
      {!loading && data && data.pan && (
        <div className="mt-3 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700">Card Number</span>
              <AppButton
                size="xs"
                variant="ghost"
                type="button"
                onClick={() => setShowPan((s) => !s)}
              >
                {showPan ? "Hide" : "Show"}
              </AppButton>
            </div>
            <div className="mt-1 font-mono text-base md:text-lg tracking-widest text-neutral-900">
              {maskPan(data.pan, showPan)}
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700">CVV</span>
                <AppButton
                  size="xs"
                  variant="ghost"
                  type="button"
                  onClick={() => setShowCVV((s) => !s)}
                >
                  {showCVV ? "Hide" : "Show"}
                </AppButton>
              </div>
              <div className="mt-1 font-mono text-sm md:text-base text-neutral-900">
                {maskCVV(data.cvv, showCVV)}
              </div>
            </div>
            {data.expiry && (
              <div>
                <p className="font-semibold text-neutral-700">Expiry</p>
                <p className="mt-1 font-mono text-sm md:text-base text-neutral-900">{data.expiry}</p>
              </div>
            )}
            {typeof data.balance === "number" && (
              <div>
                <p className="font-semibold text-neutral-700">Balance</p>
                <p className="mt-1 font-mono text-sm md:text-base text-neutral-900">{data.balance}</p>
              </div>
            )}
          </div>
          <div className="text-neutral-600">
            {data.holder && <span className="mr-2">{data.holder}</span>}
            {data.brand && (
              <span className="uppercase text-[10px] md:text-[11px] tracking-wide">{data.brand}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
