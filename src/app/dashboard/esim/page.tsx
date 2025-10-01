export default function EsimPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">eSIM</h2>
        <p className="text-sm text-neutral-600 max-w-prose">Provision and monitor software-based cellular profiles spanning carriers and regions.</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {["Profiles Issued", "Active", "Suspended", "Data (GB / 24h)", "Regions", "Carriers", "Failures", "Latency (ms)"].map((t) => (
          <div key={t} className="rounded-xl border border-black/10 bg-white/70 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{t}</p>
            <p className="mt-2 text-lg font-semibold tracking-tight">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <h3 className="text-sm font-medium mb-3">Recent Provisioning Events</h3>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li>••• Activation event placeholder</li>
          <li>••• Data threshold alert placeholder</li>
          <li>••• Carrier failover placeholder</li>
        </ul>
      </div>
    </div>
  );
}
