import React from "react";
import { CableSubscriptionForm } from "./CableSubscriptionForm";

export const metadata = {
  title: "Cable Subscription | Utilities",
};

export default function CablePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Cable Subscription</h1>
        <p className="text-xs text-neutral-500 mt-1 max-w-prose">Subscribe or renew your cable TV plans (GOtv, DStv, StarTimes, etc.). Select a service and plan, then confirm. Plan list updates automatically when you change the service.</p>
      </div>
      <CableSubscriptionForm />
    </div>
  );
}
