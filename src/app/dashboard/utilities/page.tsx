export default function UtilitiesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Utilities</h2>
        <p className="text-sm text-neutral-600 max-w-prose">Unified operational tools spanning financial transactions, telecom provisioning, and analytics. Replace these placeholders with live widgets tied to your APIs.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          "KYC Verification Queue",
          "Fraud Monitoring",
          "Limits & Thresholds",
          "Scheduled Tasks",
          "Webhook Delivery",
          "API Usage",
        ].map((title) => (
          <div key={title} className="rounded-2xl border border-black/10 bg-white/70 p-5">
            <h3 className="text-sm font-medium mb-2">{title}</h3>
            <p className="text-xs leading-relaxed text-neutral-600">Integrate real data by querying internal services or external providers. Keep modules self-contained.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
