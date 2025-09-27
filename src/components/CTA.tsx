import Link from "next/link";

export default function CTA() {
  return (
    <section className="mt-24 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl p-8 sm:p-12 shadow-lg">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Ready to Simplify Your Digital Payments?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-indigo-100/90">
          Join thousands of Nigerians who trust Finsync for fast, secure, and
          convenient transactions. Your all-in-one digital wallet is just a
          click away.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/signup"
            className="inline-block rounded-md bg-white text-indigo-600 font-semibold px-6 py-3 shadow hover:opacity-95"
          >
            Create Your Free Account Now
          </Link>
        </div>
      </div>
    </section>
  );
}
