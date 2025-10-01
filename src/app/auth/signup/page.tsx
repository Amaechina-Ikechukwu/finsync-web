"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

const featureHighlights = [
  {
    title: "Virtual cards in minutes",
    description:
      "Spin up secure Dollar and Naira cards for subscriptions, ads, and global shopping without limits.",
  },
  {
    title: "Reliable POS & agent tools",
    description:
      "Grow revenue with dependable terminals, instant commissions, and a nationwide agent network.",
  },
  {
    title: "Send & receive instantly",
    description:
      "Move money to any Nigerian bank, fund wallets, and receive payments with zero delay.",
  },
];

const inputClasses =
  "w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm transition focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-black/5";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch = useMemo(
    () => confirmPassword.length > 0 && confirmPassword !== password,
    [confirmPassword, password],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordMismatch) {
      setError("Passwords don’t match yet. Give them another glance.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({ email, password });
      setSuccess("Nice! Your account is alive and ready.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/dashboard");
      }, 850);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went sideways. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-12">
      <div className="auth-card mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_1fr]">
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
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                Welcome aboard
              </p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                A universe of services in your pocket
              </h1>
              <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                Cards, POS, eSIMs, crypto, and bill payments—all inside one
                secure super app built for Nigeria.
              </p>
            </div>
            <dl className="grid gap-5">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="auth-pill-dark rounded-2xl p-5"
                >
                  <dt className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">
                    {feature.title}
                  </dt>
                  <dd className="mt-3 text-sm text-white/80">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3 text-sm text-white/60">
            <p className="font-medium text-white/70">
              Getting started is easy:
            </p>
            <p>
              Fund your wallet, activate a virtual card, and invite teammates
              when you’re ready to scale.
            </p>
          </div>
        </aside>

        <section className="relative flex flex-col justify-center p-10 sm:p-14">
          <div className="mx-auto w-full max-w-md space-y-8">
            <header className="space-y-2">
              <p className="auth-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-neutral-600">
                Start free
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Let’s get you signed up
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Use your company email so we can fast-track provisioning.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="finance@yourcompany.com"
                  className={inputClasses}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="●●●●●●●●"
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
                  >
                    Confirm
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="●●●●●●●●"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-3 text-xs text-neutral-500">
                <p>
                  By creating an account, you agree to our{" "}
                  <Link
                    className="font-semibold text-black underline-offset-4 transition hover:underline"
                    href="/terms"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="font-semibold text-black underline-offset-4 transition hover:underline"
                    href="/privacy"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {(error || passwordMismatch) && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error ?? "Passwords don’t match."}
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
                {isSubmitting ? "Creating your seat…" : "Create account"}
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
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-black underline-offset-4 transition hover:underline"
              >
                Sign in instead
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
