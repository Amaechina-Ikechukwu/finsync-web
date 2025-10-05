"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { fetchCurrentUser } from "@/lib/apiClient";
import Loader from "@/components/Loader";
import { useToast } from "@/components/toast/ToastProvider";

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm transition focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-black/5";

export default function BVNPhonePage() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("sessionId") ?? "";
  const maskedPhone = params.get("maskedPhone") ?? "";
  const { getIdToken, user, loading: authLoading } = useAuth();
  const { push } = useToast();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  // Guard: must be logged in; if already verified, go dashboard
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (authLoading) return;
      if (!user) {
        setChecking(false);
        push({
          title: "Please sign in",
          description: "Sign in to continue.",
          variant: "warning",
        });
        router.replace("/auth/signin");
        return;
      }
      try {
        const token = await getIdToken();
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

  useEffect(() => {
    // prefill masked hint if available
    if (maskedPhone) setPhone(maskedPhone.replace(/\*/g, ""));
  }, [maskedPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sessionId) {
      setError("Missing session. Please start BVN verification again.");
      return;
    }

    if (!/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const localUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${localUrl}/accounts/dojah/bvn/phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completePhone: phone, sessionId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit phone");
      }

      const json = await res.json();
      if (!json?.success)
        throw new Error(json?.message || "Phone verification failed");

      const otpId = json?.data?.otpId;

      router.push(`/auth/bvn/otp?otpId=${encodeURIComponent(otpId ?? "")}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit phone";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader message="Preparing BVN verification…" />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-12">
      <div className="auth-card mx-auto w-full max-w-md rounded-3xl bg-white p-10">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Confirm phone number</h1>
          <p className="text-sm text-neutral-600">
            Enter the phone number ending with {maskedPhone?.slice(-3) ?? ""}.
          </p>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label
            htmlFor="phone-input"
            className="block text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
          >
            Phone number
          </label>
          <input
            id="phone-input"
            inputMode="numeric"
            // pattern="\\d*"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="08101234567"
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
              {isSubmitting ? "Submitting…" : "Send OTP"}
            </button>
            <Link
              href="/auth/bvn"
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
