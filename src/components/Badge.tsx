export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 badge text-sm px-3 py-1 rounded-full">
      {children}
    </span>
  );
}
