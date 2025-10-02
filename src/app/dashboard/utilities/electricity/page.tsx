import type { Metadata } from "next";
import { ElectricityPurchaseForm } from "./ElectricityPurchaseForm";

export const metadata: Metadata = {
  title: "Electricity Bills",
  description: "Purchase prepaid tokens or pay postpaid electricity bills.",
};

export default function ElectricityPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Electricity Payments</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Support vending of prepaid tokens and settlement of postpaid bills. Include
          meter validation, tariff detection, token retrieval, receipt storage, and
          retry logic for pending vend operations.
        </p>
      </header>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <ElectricityPurchaseForm />
      </div>
    </div>
  );
}