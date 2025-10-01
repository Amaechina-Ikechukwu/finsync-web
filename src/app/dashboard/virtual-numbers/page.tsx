export default function VirtualNumbersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Virtual Numbers</h2>
        <p className="text-sm text-neutral-600 max-w-prose">Programmable voice & SMS numbers across geographies with routing policies and analytics.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {["Numbers", "Inbound / 24h", "Outbound / 24h", "Failed", "Regions", "Average Response"].map((t) => (
          <div key={t} className="rounded-xl border border-black/10 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <h3 className="text-sm font-medium mb-3">Routing Events</h3>
        <p className="text-sm text-neutral-600">Integrate voice / SMS provider hooks here for diagnostics and SLAs.</p>
      </div>
    </div>
  );
}
