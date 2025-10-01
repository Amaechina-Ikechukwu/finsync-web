import type { ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-black/10 bg-white/70 px-4 backdrop-blur-sm md:px-8">
      <h1 className="text-base font-semibold tracking-tight">Finsync Dashboard</h1>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <UserBadge size="sm" showEmail={false} />
        
        <button type="button" className="rounded-md border border-black/10 bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition">
          Sign Out
        </button>
      </div>
    </header>
  );
}
