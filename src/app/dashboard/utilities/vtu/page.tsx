import type { Metadata } from "next";
import { VTUTabs } from "./components/VTUTabs";

export const metadata: Metadata = {
  title: "VTU (Airtime & Data)",
  description: "Purchase airtime and data bundles across supported networks.",
};

// Server component wrapper providing static metadata & layout. Client interactivity
// moved to DataPlansExplorer to satisfy Next.js rule prohibiting metadata export
// from a client component.
export default function VTUPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">VTU (Airtime & Data)</h2>
        <p className="text-sm text-neutral-600 max-w-prose">
          Purchase airtime and data bundles across supported telecom networks. This
          interface lets you explore available data plans. Buying flows & wallet
          debits will be integrated subsequently.
        </p>
      </header>
  <VTUTabs />
    </div>
  );
}