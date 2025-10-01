"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

const benefits = [
  {
    title: "Bank-grade security",
    description:
      "PCI-DSS compliant protocols, end-to-end encryption, and biometric checks guard every move.",
  },
  {
    title: "Lightning-fast transactions",
    description:
      "Top-ups, transfers, and payments post instantly—no network delays, day or night.",
  },
  {
    title: "Dedicated 24/7 support",
    description:
      "Get a real person on chat, email, or phone whenever you need a hand.",
  },
];

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm transition focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-black/5";

export default function SignInPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      setSuccess("Welcome back. Loading your workspace…");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn’t verify those details. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-12">
      <div className="auth-card mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 overflow-hidden rounded-3xl lg:grid-cols-[1fr_1.05fr]">
        <aside className="relative flex flex-col justify-between gap-12 bg-[linear-gradient(135deg,_rgba(18,18,18,0.92),_rgba(18,18,18,0.75))] p-10 text-white sm:p-12">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm text-white/80 transition hover:text-white"
            >
              <Image
                src="/assets/logo.png"
                alt="Finsync logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
                priority
              />
              <span className="font-serif text-lg font-semibold tracking-tight">
                Finsync Digital Services
              </span>
            </Link>
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/55">
                Welcome back
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Your digital life in perfect sync
              </h1>
              <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                We help modern businesses keep their financial operations secure
                and tuned to how they work—simple, fast, and tailored to every
                workflow.
              </p>
            </div>
            <dl className="grid gap-5 sm:grid-cols-3">
              {benefits.map(({ title, description }) => (
                <div
                  key={title}
                  className="auth-pill-dark rounded-2xl p-5 text-left"
                >
                  <dt className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                    {title}
                  </dt>
                  <dd className="mt-3 text-sm text-white/80">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3 text-sm text-white/60">
            <p className="font-medium text-white/70">
              "Finsync has simplified my life! I pay bills and buy data for my
              whole family from one app."
            </p>
            <p className="text-xs uppercase tracking-[0.3em]">
              — Adebayo L., Lagos
            </p>
          </div>
        </aside>

        <section className="relative flex flex-col justify-center p-10 sm:p-14">
          <div className="mx-auto w-full max-w-md space-y-8">
            <header className="space-y-2">
              <p className="auth-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-neutral-600">
                Sign back in
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Good to see you again
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Enter your credentials to access real-time balances, approvals,
                and insights.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="signin-email"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
                >
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label
                    htmlFor="signin-password"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
                  >
                    Password
                  </label>
                  <input
                    id="signin-password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="●●●●●●●●"
                    className={inputClasses}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border border-black/15 text-black focus:ring-black/30"
                    />
                    <span className="uppercase tracking-[0.3em]">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="#"
                    className="font-semibold uppercase tracking-[0.3em] text-black transition hover:opacity-80"
                  >
                    Forgot?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/60"
              >
                {isSubmitting ? "Verifying…" : "Continue"}
                <svg
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <p className="text-sm text-neutral-600">
              Need an account?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-black underline-offset-4 transition hover:underline"
              >
                Start here
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
