import Link from "next/link";

// Simple className merge helper (avoid adding a dependency for now)
function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

interface UtilityCardProps {
  title: string;
  href: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export function UtilityCard({ title, href, description, icon, className }: UtilityCardProps) {
  return (
    <Link
      href={href}
      className={cx(
        "group flex flex-col rounded-2xl border border-black/10 bg-white/70 p-5 transition hover:border-black/20 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <h3 className="text-sm font-semibold tracking-tight group-hover:underline">
          {title}
        </h3>
      </div>
      <p className="text-xs leading-relaxed text-neutral-600 flex-1">{description}</p>
      <span className="mt-4 inline-flex items-center text-[11px] font-medium text-neutral-700 group-hover:text-neutral-900">
        Open<span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

export default UtilityCard;