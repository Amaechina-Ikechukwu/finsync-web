import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function Badge({ children, className }: BadgeProps) {
  const baseClasses =
    "inline-flex items-center gap-2 badge text-sm px-3 py-1 rounded-full";

  return (
    <span className={`${baseClasses} ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}
