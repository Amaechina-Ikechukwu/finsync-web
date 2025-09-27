import Badge from "./Badge";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex-1 max-w-2xl">
      <div className="mb-5">
        <Badge>Your digital life in perfect sync.</Badge>
      </div>
      <h1
        className="text-4xl sm:text-6xl font-serif font-semibold leading-[1.05] tracking-tight mb-6"
        style={{ color: "var(--heading)" }}
      >
        Finsync Digital Services
      </h1>
      <p className="text-base sm:text-lg text-neutral-600 mb-10 max-w-lg leading-relaxed">
        We help modern businesses keep their financial operations secure and in
        perfect sync—simple, fast, and tailored to how you work.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="#get-started"
          className="inline-block cta-primary px-7 py-3 rounded-md text-sm font-medium tracking-wide shadow-sm hover:shadow transition-all"
        >
          Get Started
        </Link>
        <Link
          href="#services-heading"
          className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
        >
          Explore Services →
        </Link>
      </div>
    </section>
  );
}
