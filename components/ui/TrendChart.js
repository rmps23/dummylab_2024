"use client";

import { useState } from "react";

// KDA per game as a line with an area fill, with win/loss ticks underneath. Oldest game on the left.
// `games` is ordered newest first. Hover (or focus, or tap) a game to read its numbers.
export default function TrendChart({ games, kdaOf }) {
  const [active, setActive] = useState(null);
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
  const g = active === null ? null : rows[active];

  return (
    <div className="relative" onPointerLeave={() => setActive(null)}>
      <svg viewBox={`0 0 ${W} ${H + 12}`} className="h-40 w-full" role="img" aria-label="KDA trend over the last games. Hover a game for its numbers.">
        <defs>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4AC0DE" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4AC0DE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" x2={W} y1={y(avg)} y2={y(avg)} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
        <text x="2" y={y(avg) - 4} fontSize="10" fill="#8C949D">avg {avg.toFixed(2)}</text>
        <polygon points={area} fill="url(#trend-fill)" />
        <polyline points={line} fill="none" stroke="#4AC0DE" strokeWidth="2.5" strokeLinejoin="round" />
        {active !== null && <line x1={x(active)} x2={x(active)} y1="0" y2={H} stroke="rgba(255,255,255,0.25)" />}
        {rows.map((row, i) => (
          <g key={row.id}>
            <circle cx={x(i)} cy={y(values[i])} r={active === i ? 5.5 : 3.5} fill={active === i ? "#4AC0DE" : "#15171B"} stroke="#4AC0DE" strokeWidth="2" />
            <rect x={x(i) - step / 2 + 2} y={H + 2} width={step - 4} height={6} rx={2} fill={row.win ? "#3DD6A0" : "#FF6B7A"} opacity={active === null || active === i ? 1 : 0.5} />
            {/* A full-height hit area per game, so the whole column reacts. */}
            <rect
              x={x(i) - step / 2}
              y="0"
              width={step}
              height={H + 12}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`Game ${i + 1}: KDA ${values[i].toFixed(2)}, ${row.win ? "win" : "loss"}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="outline-none focus-visible:stroke-brand"
              style={{ cursor: "crosshair" }}
            />
          </g>
        ))}
      </svg>

      {g && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line-strong bg-raised px-3 py-2 text-xs shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, (x(active) / W) * 100))}%`, top: 0 }}
        >
          <div className="text-base font-bold leading-none">KDA {values[active].toFixed(2)}</div>
          <div className="mt-1 text-zinc-300">
            {g.kills} / <span className="text-loss">{g.deaths}</span> / {g.assists}
            {g.champion ? ` · ${g.champion}` : ""}
          </div>
          <div className={`mt-0.5 font-bold uppercase ${g.win ? "text-win" : "text-loss"}`}>{g.win ? "Win" : "Loss"}</div>
        </div>
      )}
    </div>
  );
}
