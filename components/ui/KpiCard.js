export default function KpiCard({ label, value, hint }) {
  return (
    <div className="bg-zinc-800 rounded-md p-3 min-w-32">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-2xl">{value}</div>
      {hint && <div className="text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}
