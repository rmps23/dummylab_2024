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
        <defs>
          <linearGradient id="donut-good" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={good ? "url(#donut-good)" : "#fb7185"}
          strokeWidth={stroke}
          strokeLinecap="round"
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
