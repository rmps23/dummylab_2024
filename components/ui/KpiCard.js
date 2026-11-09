// A headline number with a small label. `accent` colours the value only where it carries meaning.
const VALUE = { brand: "", accent: "", win: "text-win", loss: "text-loss", amber: "text-warn" };

export default function KpiCard({ label, value, hint, title, accent = "brand", children }) {
  return (
    <div title={title} className="min-w-[8.5rem] flex-1 animate-rise rounded-xl border border-line bg-panel p-4">
      <div className="eyebrow">{label}</div>
      <div className={`mt-1.5 text-3xl font-bold leading-none ${VALUE[accent] ?? ""}`}>{value}</div>
      {hint && <div className="mt-2 text-xs text-zinc-400">{hint}</div>}
      {children}
    </div>
  );
}
