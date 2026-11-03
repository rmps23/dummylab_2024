// Win/loss bars with a KDA line, oldest game on the left. `games` is ordered newest first.
export default function TrendChart({ games, kdaOf }) {
  const rows = [...games].reverse();
  if (rows.length < 2) return <p className="text-sm text-zinc-400">Not enough games for a trend.</p>;

  const W = 600;
  const H = 120;
  const values = rows.map(kdaOf);
  const max = Math.max(...values, 1);
  const step = W / rows.length;
  const points = values.map((v, i) => `${i * step + step / 2},${H - (v / max) * (H - 12) - 4}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full h-36" role="img" aria-label="KDA trend over the last games">
      {rows.map((g, i) => (
        <rect key={g.id} x={i * step + 2} y={H} width={step - 4} height={6} rx={2} fill={g.win ? "#10b981" : "#ef4444"} />
      ))}
      <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="2" />
      {values.map((v, i) => (
        <circle key={i} cx={i * step + step / 2} cy={H - (v / max) * (H - 12) - 4} r="3" fill="#22d3ee">
          <title>{`KDA ${v.toFixed(2)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
