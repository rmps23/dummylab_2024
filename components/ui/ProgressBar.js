export default function ProgressBar({ value, label = "Progress" }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="h-2 w-full overflow-hidden rounded-full bg-zinc-700"
    >
      <div className="h-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
