export default function KpiCard({ label, value, hint, title }) {
  return (
    <div className="min-w-32 rounded-md bg-zinc-800 p-3" title={title}>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-2xl">{value}</div>
      {hint && <div className="text-xs text-zinc-400">{hint}</div>}
    </div>
  );
}
