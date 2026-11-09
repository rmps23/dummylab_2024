// Win-rate ring. `value` is 0-100.
export default function Donut({ value, size = 96, label = "Win rate" }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const good = pct >= 50;

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }} role="img" aria-label={`${label} ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#262A30" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={good ? "#4AC0DE" : "#FF6B7A"}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none">{pct}%</span>
        <span className="eyebrow mt-1 !text-[9px]">{label}</span>
      </div>
    </div>
  );
}
