export default function CryptoPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Crypto</h2>
        <p className="text-sm text-neutral-600 max-w-prose">Custodial & non-custodial wallet aggregation, portfolio performance, and on/off ramp orchestration.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {["Total Holdings", "24h PnL", "On-Ramp Volume", "Off-Ramp Volume", "Active Wallets", "Networks"].map((t) => (
          <div key={t} className="rounded-xl border border-black/10 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-black/10 bg-white/70 p-6">
        <h3 className="text-sm font-medium mb-3">Network Activity</h3>
        <p className="text-sm text-neutral-600">Plug in chain indexer metrics, mempool latency, or gas fee time series here.</p>
      </div>
    </div>
  );
}
