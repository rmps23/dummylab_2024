// KDA per game as a line with an area fill, with win/loss ticks underneath. Oldest game on the left.
// `games` is ordered newest first.
export default function TrendChart({ games, kdaOf }) {
  const rows = [...games].reverse();
  if (rows.length < 2) return <p className="text-sm text-zinc-400">Not enough games for a trend.</p>;

  const W = 600;
  const H = 120;
  const values = rows.map(kdaOf);
  const max = Math.max(...values, 1);
  const step = W / rows.length;
  const x = (i) => i * step + step / 2;
  const y = (v) => H - (v / max) * (H - 16) - 6;
  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${x(0)},${H} ${line} ${x(values.length - 1)},${H}`;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return (
    <svg viewBox={`0 0 ${W} ${H + 12}`} className="h-40 w-full" role="img" aria-label="KDA trend over the last games">
      <defs>
        <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3ab5c6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3ab5c6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2={W} y1={y(avg)} y2={y(avg)} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
      <polygon points={area} fill="url(#trend-fill)" />
      <polyline points={line} fill="none" stroke="#3ab5c6" strokeWidth="2.5" strokeLinejoin="round" />
      {rows.map((g, i) => (
        <g key={g.id}>
          <circle cx={x(i)} cy={y(values[i])} r="3.5" fill="#09090b" stroke="#3ab5c6" strokeWidth="2">
            <title>{`KDA ${values[i].toFixed(2)} · ${g.win ? "Win" : "Loss"}`}</title>
          </circle>
          <rect x={x(i) - step / 2 + 2} y={H + 2} width={step - 4} height={6} rx={2} fill={g.win ? "#34d399" : "#fb7185"} />
        </g>
      ))}
    </svg>
  );
}
