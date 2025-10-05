"use client";
import { useEffect, useState, type ReactNode } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import UserBadge from "@/components/UserBadge";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/ToastProvider";
import Loader from "@/components/Loader";
import { fetchCurrentUser } from "@/lib/apiClient";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
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
        const token = await getIdToken();
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
      } catch {
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
        <TopBar onRequestSignOut={() => setShowConfirm(true)} />
        <main className="flex-1 p-4 md:p-8 space-y-8">{children}</main>
      </div>

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

function TopBar({ onRequestSignOut }: { onRequestSignOut: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-black/10 bg-white/70 px-4 backdrop-blur-sm md:px-8">
      <h1 className="text-base font-semibold tracking-tight">
        Finsync Dashboard
      </h1>
      <div className="ml-auto flex items-center gap-3 text-sm">
        <UserBadge size="sm" showEmail={false} />

        <button
          onClick={onRequestSignOut}
          type="button"
          className="rounded-md border border-black/10 bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition"
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
        } catch (e) {
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
