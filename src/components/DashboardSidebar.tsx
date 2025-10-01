"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/utilities", label: "Utilities" },
  { href: "/dashboard/cards", label: "Cards" },
  { href: "/dashboard/crypto", label: "Crypto" },
  { href: "/dashboard/esim", label: "eSIM" },
  { href: "/dashboard/virtual-numbers", label: "Virtual Numbers" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col gap-4 border-r border-black/10 bg-white/60 backdrop-blur-sm p-4">
      <div className="px-2 pt-2 pb-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-600">
          Dashboard
        </h2>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-600 hover:text-black hover:bg-black/5"
              }`}
            >
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-black group-hover:bg-black/20">
                  {item.badge}
                </span>
              ) : null}
              {active && (
                <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-black/0 via-white to-black/0" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto pt-4 px-2">
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Secure financial & telecom utilities in one unified surface.
        </p>
      </div>
    </aside>
  );
}
