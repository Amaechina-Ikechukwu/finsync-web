import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
  description?: string;
}

/**
 * Reusable layout wrapper for legal / policy pages to keep typography and spacing consistent.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
  description,
}: LegalPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-5 sm:px-10 py-12 lg:py-20">
      <header className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-neutral-600 mb-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        ) : null}
        <p className="text-xs uppercase tracking-wide text-neutral-500 font-medium">
          Last updated: {lastUpdated}
        </p>
      </header>
      <article className="legal-content text-sm leading-relaxed space-y-6">
        {children}
      </article>
    </main>
  );
}

export default LegalPage;
