"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { fetchCurrentUser } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { useToast } from "@/components/toast/ToastProvider";

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm transition focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-black/5";

function BVNOtpPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const otpId = params.get("otpId") ?? "";
  const { getIdToken, user, loading: authLoading } = useAuth();
  const { push } = useToast();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Guard: must be logged in; if already verified, redirect
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (authLoading) return;
      if (!user) {
        setChecking(false);
        push({
          title: "Please sign in",
          description: "Sign in to proceed.",
          variant: "warning",
        });
        router.replace("/auth/signin");
        return;
      }
      try {
        const token = await getIdToken(true);
        if (!token) throw new Error("No token");
        const me = await fetchCurrentUser(token);
        if (me?.data?.bvnVerified) {
          push({
            title: "Already verified",
            description: "Redirecting to dashboard…",
            variant: "success",
            durationMs: 2200,
          });
          router.replace("/dashboard");
          return;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpId) {
      setError("Missing OTP session. Please start again.");
      return;
    }

    if (!/^\d{4,6}$/.test(otp)) {
      setError("Please enter a valid OTP code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getIdToken(true);
      if (!token) throw new Error("Not authenticated");

      const localUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${localUrl}/accounts/dojah/bvn/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otpCode: otp, otpId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to verify OTP");
      }

      const json = await res.json();
      if (!json?.success)
        throw new Error(json?.message || "OTP verification failed");

      // success — navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to verify OTP";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader message="Checking your session…" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-12">
      <div className="auth-card mx-auto w-full max-w-md rounded-3xl bg-white p-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Enter OTP</h1>
          <p className="text-sm text-neutral-600">
            We sent a one-time code to your phone. Enter it below.
          </p>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label
            htmlFor="otp-input"
            className="block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            OTP code
          </label>
          <input
            id="otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="042830"
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
              {isSubmitting ? "Verifying…" : "Verify"}
            </button>
            <Link
              href="/auth/bvn/phone"
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

export default function BVNOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center">
          <Loader message="Loading..." />
        </div>
      }
    >
      <BVNOtpPageInner />
    </Suspense>
  );
}
