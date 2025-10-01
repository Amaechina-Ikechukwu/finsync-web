export default function CardsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Cards</h2>
        <p className="text-sm text-neutral-600 max-w-prose">Issue, manage, and monitor physical & virtual payment cards. This section will house card lifecycle management, spend controls, and compliance surfaces.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["Issued Today", "Active Cards", "Frozen", "Spend (24h)", "Pending Shipments", "Rule Violations"].map((m) => (
          <div key={m} className="rounded-xl border border-black/10 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{m}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <h3 className="text-sm font-medium mb-3">Recent Card Actions</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>••• Replace with card issuance events</li>
          <li>••• Replace with spend anomalies</li>
          <li>••• Replace with rule configuration changes</li>
        </ul>
      </div>
    </div>
  );
}
