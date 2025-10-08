import StatCard from "@/components/StatCard";
import UserCards from "@/components/UserCards";
import ChartPlaceholder from "@/components/ChartPlaceholder";
import RecentTransactions from "@/components/RecentTransactions";
import ActivityFeed from "@/components/ActivityFeed";
import NotificationList from "@/components/NotificationList";
import AccountInfoCard from "@/components/AccountInfoCard";
import TransactionSummaryStats from "@/components/TransactionSummaryStats";

export default function OverviewPage() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-neutral-500">
          Overview
        </h2>
        {/* Primary stats row now includes AccountInfoCard for prominence */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <AccountInfoCard />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <UserCards />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
            Transaction Summary
          </h3>
          <TransactionSummaryStats />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RecentTransactions limit={5} />
        </div>
        <div className="space-y-6">
          {/* <ActivityFeed
            items={[
              {
                id: "1",
                actor: "System",
                action: "synchronized",
                target: "balances",
                time: new Date().toISOString(),
                meta: "All ledgers up to date",
              },
              {
                id: "2",
                actor: "Policy Engine",
                action: "approved",
                target: "card limit change",
                time: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
                meta: "Team marketing • +$2,500",
              },
            ]}
          /> */}
          <NotificationList limit={6} pollIntervalMs={60000} />
          <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-neutral-500">
              Next Steps
            </h3>
            <ul className="ml-4 list-disc space-y-2 text-sm text-neutral-600">
              <li>Connect a new business debit card</li>
              <li>Enable multi-factor authentication</li>
              <li>Invite teammates to collaborate</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
