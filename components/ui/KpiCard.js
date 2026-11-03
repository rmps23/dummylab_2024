// A headline number with a small label; `accent` colours the top edge, `children` adds extra content.
const ACCENT = {
  brand: "from-brand/70",
  accent: "from-accent/70",
  win: "from-win/70",
  loss: "from-loss/70",
  amber: "from-amber-400/70",
};

export default function KpiCard({ label, value, hint, title, accent = "brand", children }) {
  return (
    <div
      title={title}
      className="relative min-w-[8.5rem] flex-1 animate-rise overflow-hidden rounded-xl border border-white/[0.07] bg-panel/80 p-4 shadow-card"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${ACCENT[accent]} to-transparent`} />
      <div className="eyebrow">{label}</div>
      <div className="mt-1 text-3xl font-bold leading-none">{value}</div>
      {hint && <div className="mt-2 text-xs text-zinc-400">{hint}</div>}
      {children}
    </div>
  );
}
