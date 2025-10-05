"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseAuth } from "@/lib/firebaseClient";
import { fetchCurrentUser } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { useToast } from "@/components/toast/ToastProvider";

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm transition focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-black/5";

export default function BVNPage() {
  const router = useRouter();
  const auth = getFirebaseAuth();
  const { user, getIdToken, loading: authLoading } = useAuth();
  const { push } = useToast();
  const [bvn, setBvn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Guard: require login, and if already BVN verified -> go dashboard
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Wait until auth state known
      if (authLoading) return;
      if (!user) {
        setChecking(false);
        push({
          title: "Please sign in",
          description: "You need to sign in to continue BVN verification.",
          variant: "warning",
        });
        router.replace("/auth/signin");
        return;
      }
      try {
        const token = await getIdToken();
        if (!token) throw new Error("No auth token");
        const me = await fetchCurrentUser(token);
        if (me?.data?.bvnVerified) {
          push({
            title: "BVN already verified",
            description: "You're all set. Redirecting to dashboard…",
            variant: "success",
            durationMs: 2500,
          });
          router.replace("/dashboard");
          return;
        }
      } catch {
        // If fetching profile fails, assume not allowed and send to signin
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
  }, [user, authLoading, getIdToken, router, push]);

  const validateBvn = (value: string) => {
    const digitsOnly = value.replace(/\s+/g, "");
    return /^\d{11}$/.test(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateBvn(bvn)) {
      setError("BVN must be 11 digits long and contain only numbers.");
      return;
    }

    setIsSubmitting(true);

    try {
      await auth?.currentUser?.reload();
      const token = await auth.currentUser?.getIdToken();

      if (!token) throw new Error("Not authenticated");

      const localUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${localUrl}/accounts/dojah/bvn/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bvn }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to start BVN verification");
      }

      const json = await res.json();

      if (!json?.success) {
        throw new Error(json?.message || "BVN verification failed");
      }

      const { sessionId, maskedPhone } = json.data ?? {};

      // navigate to phone entry page, passing sessionId and maskedPhone via query
      router.push(
        `/auth/bvn/phone?sessionId=${encodeURIComponent(
          sessionId,
        )}&maskedPhone=${encodeURIComponent(maskedPhone ?? "")}`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to verify BVN. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader message="Checking your access…" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-12">
      <div className="auth-card mx-auto w-full max-w-md rounded-3xl bg-white p-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Enter your BVN</h1>
          <p className="text-sm text-neutral-600">
            We need your BVN to complete identity verification.
          </p>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label
            htmlFor="bvn-input"
            className="block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            BVN
          </label>
          <input
            inputMode="numeric"
            // pattern="\\d*"
            id="bvn-input"
            maxLength={11}
            value={bvn}
            onChange={(e) => setBvn(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="12345678901"
            className={inputClasses}
          />

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? "Verifying…" : "Continue"}
            </button>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 px-5 py-3 text-sm"
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
