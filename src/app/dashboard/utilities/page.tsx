import Loader from "@/components/Loader";
import UtilityCard from "@/components/UtilityCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilities",
  description: "Airtime & data (VTU), betting wallet funding, and electricity bill payments.",
};

const utilities = [
  {
    title: "VTU (Airtime & Data)",
    href: "/dashboard/utilities/vtu",
    description:
      "Purchase airtime and data bundles across major networks. Supports wallet debit, multiple network detection, and transaction status callbacks.",
   
  },
  {
    title: "Betting Funding",
    href: "/dashboard/utilities/betting",
    description:
      "Fund supported betting wallets instantly. Track provider balance, enforce limits, and reconcile unsettled transactions.",
    
  },
  {
    title: "Electricity Bills",
    href: "/dashboard/utilities/electricity",
    description:
      "Vend prepaid tokens or pay postpaid bills. Includes meter validation, token retrieval, and receipt archiving.",
   
  },
  {
    title: "Cable TV",
    href: "/dashboard/utilities/cable",
    description:
      "Subscribe or renew GOtv, DStv, StarTimes, and more. Fetch live plan variations, confirm pricing, and process wallet debits with idempotent references.",
  },
];

export default function UtilitiesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Utilities</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Core value-added services integrated into the platform. These modules will surface live provider balances, pricing, and transaction timelines once wired to your APIs.
        </p>
      </header>
      <Loader/>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {utilities.map((u) => (
          <UtilityCard key={u.href} {...u} />
        ))}
      </div>
    </div>
  );
}
