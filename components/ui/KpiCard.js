// A headline number with a small label. `accent` is kept for callers but no longer paints the card;
// `children` adds extra content.
export default function KpiCard({ label, value, hint, title, children }) {
  return (
    <div title={title} className="min-w-[8.5rem] flex-1 animate-rise rounded-lg border border-white/[0.08] bg-panel p-4">
      <div className="eyebrow">{label}</div>
      <div className="font-display mt-1.5 text-3xl font-bold leading-none">{value}</div>
      {hint && <div className="mt-2 text-xs text-zinc-400">{hint}</div>}
      {children}
    </div>
  );
}
