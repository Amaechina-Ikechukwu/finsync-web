"use client";
import { useEffect, useState, type ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import UserBadge from "@/components/UserBadge";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastProvider";
import Loader from "@/components/Loader";
import { fetchCurrentUser } from "@/lib/apiClient";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, getIdToken, loading: authLoading } = useAuth();
  const { push } = useToast();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (authLoading) return;
      if (!user) {
        setChecking(false);
        push({
          title: "Please sign in",
          description: "Sign in to access your dashboard.",
          variant: "warning",
        });
        router.replace("/auth/signin");
        return;
      }
      try {
        const token = await getIdToken(true);
        if (!token) throw new Error("No token");
        const me = await fetchCurrentUser(token);
        if (!me?.data?.bvnVerified) {
          push({
            title: "Complete BVN verification",
            description: "We need your BVN to unlock the dashboard.",
            variant: "info",
          });
          router.replace("/auth/bvn");
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        // Handle misconfiguration or network issues without logging user out
        if (message.includes("NEXT_PUBLIC_API_URL is not configured")) {
          push({
            title: "App not configured",
            description:
              "Missing NEXT_PUBLIC_API_URL. Set it in .env.local and reload.",
            variant: "error",
          });
          return;
        }
        const statusMatch = message.match(/Failed to fetch user \((\d{3})\)/);
        if (statusMatch) {
          const status = Number(statusMatch[1]);
          if (status === 401) {
            push({
              title: "Session expired",
              description: "Please sign in again.",
              variant: "error",
            });
            router.replace("/auth/signin");
            return;
          }
          push({
            title: `Profile load failed (${status})`,
            description: "We'll keep you here. Try again shortly.",
            variant: "warning",
          });
          return;
        }
        if (
          message.includes("Failed to fetch") ||
          message.includes("NetworkError")
        ) {
          push({
            title: "Network error",
            description: "We couldn't reach the API. Check your connection.",
            variant: "warning",
          });
          return;
        }
        // Default: treat as auth expired
        push({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "error",
        });
        router.replace("/auth/signin");
        return;
      } finally {
        if (!cancelled) setChecking(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, getIdToken, router, push]);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader message="Preparing your dashboard…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] w-full">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <TopBar
          onRequestSignOut={() => setShowConfirm(true)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
          mobileOpen={mobileOpen}
        />
        <main className="flex-1 p-4 md:p-8 space-y-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <aside className="relative z-10 h-full w-64 bg-white shadow-xl border-r border-black/10 p-4 flex flex-col">
            <div className="px-2 pt-2 pb-4">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-neutral-600">
                Dashboard
              </h2>
            </div>
            <nav className="flex flex-col gap-2">
              {[
                { href: "/dashboard", label: "Overview" },
                { href: "/dashboard/utilities", label: "Utilities" },
                { href: "/dashboard/cards", label: "Cards" },
                { href: "/dashboard/crypto", label: "Crypto" },
                { href: "/dashboard/esim", label: "eSIM" },
                {
                  href: "/dashboard/virtual-numbers",
                  label: "Virtual Numbers",
                },
              ].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-black text-white shadow-sm"
                        : "text-neutral-700 hover:text-black hover:bg-black/5"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-black/0 via-white to-black/0" />
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-6 px-2">
              <button
                type="button"
                className="w-full rounded-md border border-black/10 bg-black px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                onClick={() => {
                  setMobileOpen(false);
                  setShowConfirm(true);
                }}
              >
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Modal rendered at layout root to avoid positioning/stacking issues inside header/sidebar */}
      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Close sign out confirm"
            className="absolute inset-0 bg-black/40"
            onClick={() => (!isSigningOut ? setShowConfirm(false) : null)}
            disabled={isSigningOut}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
            <h4 className="text-base font-semibold mb-2">Sign out?</h4>
            <p className="text-sm text-neutral-700 mb-4">
              You will need to sign in again to access your dashboard.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-60"
                onClick={() => setShowConfirm(false)}
                disabled={isSigningOut}
              >
                Cancel
              </button>
              <SignOutButton
                isSigningOut={isSigningOut}
                onStart={() => setIsSigningOut(true)}
                onFinish={() => {
                  setIsSigningOut(false);
                  setShowConfirm(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TopBar({
  onRequestSignOut,
  onToggleMobile,
  mobileOpen,
}: {
  onRequestSignOut: () => void;
  onToggleMobile: () => void;
  mobileOpen: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-black/10 bg-white/70 px-4 backdrop-blur-sm md:px-8">
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
        className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 hover:bg-black/5"
        onClick={onToggleMobile}
      >
        {mobileOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <title>Close menu</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <title>Open menu</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
      <h1 className="text-base font-semibold tracking-tight">
        Finsync Dashboard
      </h1>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <UserBadge size="sm" showEmail={false} />
        {/* Hide sign out on small screens; show on md+ */}
        <button
          onClick={onRequestSignOut}
          type="button"
          className="hidden md:inline-flex rounded-md border border-black/10 bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

function SignOutButton({
  isSigningOut,
  onStart,
  onFinish,
}: {
  isSigningOut: boolean;
  onStart: () => void;
  onFinish: () => void;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="inline-flex items-center rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-60"
      onClick={async () => {
        onStart();
        try {
          await getFirebaseAuth().signOut();
          router.push("/auth/signin");
        } catch (_e) {
          // Optional: could add toast here
        } finally {
          onFinish();
        }
      }}
      disabled={isSigningOut}
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
