"use client";
import { useState } from "react";
import ActivityFeed, { type ActivityItem } from "@/components/ActivityFeed";
import { BettingForm } from "./BettingForm";

export default function BettingUtilityPage() {
	const [activities, setActivities] = useState<ActivityItem[]>([]);

	const pushActivity = (partial: Omit<ActivityItem, "id" | "time"> & { id?: string; time?: string }) => {
		const id = partial.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
		setActivities((prev) => [
			{ id, time: partial.time || new Date().toISOString(), ...partial },
			...prev.slice(0, 49), // cap to 50
		]);
		return id;
	};

	const updateActivity = (id: string, changes: Partial<ActivityItem>) => {
		setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));
	};

	// Track an in-flight id to update
	const [inFlightId, setInFlightId] = useState<string | null>(null);

	const handleVerificationState = (
		state: "loading" | "success" | "error" | "idle",
		data?: { customer_name?: string; customer_id?: string; service_name?: string; service_id?: string } | null,
	) => {
		if (state === "loading") {
			// Add a loading activity (either verification or funding)
			const id = pushActivity({
				actor: "You",
				action: data?.customer_id ? `Verifying ${data.customer_id}` : "Processing",
				meta: "Working...",
				icon: <span className="animate-pulse">⚙️</span>,
			});
			setInFlightId(id);
		} else if (state === "success" && inFlightId) {
			updateActivity(inFlightId, {
				action: data?.customer_id ? `Verified ${data.customer_id}` : "Verified",
				meta: data?.customer_name || "Verification successful",
				icon: <span>✅</span>,
			});
			setInFlightId(null);
		} else if (state === "error" && inFlightId) {
			updateActivity(inFlightId, {
				action: "Verification failed",
				meta: "See notification",
				icon: <span>⚠️</span>,
			});
			setInFlightId(null);
		} else if (state === "idle" && inFlightId) {
			// Funding completion case already handled in onFundSuccess below; mark idle only if still loading
			setInFlightId(null);
		}
	};

	const handleFundSuccess = (data: { amount: unknown; customer_id: string; service_id: string }) => {
		if (inFlightId) {
			updateActivity(inFlightId, {
				action: `Funded ${data.service_id}`,
				meta: `NGN ${data.amount} → ${data.customer_id}`,
				icon: <span>💰</span>,
			});
			setInFlightId(null);
		} else {
			pushActivity({
				actor: "You",
				action: `Funded ${data.service_id}`,
				meta: `NGN ${data.amount} → ${data.customer_id}`,
				icon: <span>💰</span>,
			});
		}
	};

	return (
		<div className="space-y-8">
			<header className="space-y-2">
				<h1 className="text-lg font-semibold tracking-tight text-neutral-900">Betting Wallet Funding</h1>
				<p className="max-w-prose text-xs text-neutral-500">
					Verify a betting account (e.g. Bet9ja, BetKing) and fund it securely from your wallet. Customer verification
					triggers automatically when you change the customer ID or service. Real-time toasts show success or errors.
				</p>
			</header>
			<div className="grid gap-8 md:grid-cols-2">
				<div className="rounded-2xl border border-black/10 bg-white/70 p-5">
					<h3 className="mb-4 text-sm font-semibold tracking-tight text-neutral-900">Fund Betting Account</h3>
					<BettingForm
						onFundSuccess={handleFundSuccess}
						onVerification={handleVerificationState}
					/>
				</div>
				<div>
					<ActivityFeed
						title="Betting Activity"
						items={activities}
						emptyLabel="No activity yet"
					/>
				</div>
			</div>
		</div>
	);
}
