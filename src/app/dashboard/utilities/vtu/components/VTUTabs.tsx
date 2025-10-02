"use client";
import { useState } from "react";
import { DataPlansExplorer } from "./DataPlansExplorer";
import { BuyAirtimeForm } from "./BuyAirtimeForm";

interface TabDef { key: string; label: string; }
const TABS: TabDef[] = [
  { key: "airtime", label: "Airtime" },
  { key: "data", label: "Data" },
];

function classNames(...tokens: (false | null | undefined | string)[]) {
  return tokens.filter(Boolean).join(" ");
}

export function VTUTabs() {
  const [active, setActive] = useState<string>("data");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={classNames(
                "relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition",
                isActive
                  ? "bg-black text-white shadow"
                  : "bg-neutral-200/70 text-neutral-700 hover:bg-neutral-300",
              )}
            >
              {tab.label}
              {isActive && (
                <span className="absolute -bottom-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-500 via-amber-500 to-emerald-500" />
              )}
            </button>
          );
        })}
      </div>
      <div>
        {active === "data" && <DataPlansExplorer />}
        {active === "airtime" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
              <h3 className="mb-4 text-sm font-semibold tracking-tight text-neutral-900">Purchase Airtime</h3>
              <BuyAirtimeForm />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Removed placeholder implementation; replaced by functional BuyAirtimeForm
