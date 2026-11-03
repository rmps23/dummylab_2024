const TIERS = {
  IRON: ["#8b8b93", "Iron"],
  BRONZE: ["#b9783f", "Bronze"],
  SILVER: ["#b4bcc8", "Silver"],
  GOLD: ["#f2c04c", "Gold"],
  PLATINUM: ["#3fc1b0", "Platinum"],
  EMERALD: ["#34d399", "Emerald"],
  DIAMOND: ["#6c9cff", "Diamond"],
  MASTER: ["#c084fc", "Master"],
  GRANDMASTER: ["#f87171", "Grandmaster"],
  CHALLENGER: ["#67e8f9", "Challenger"],
};
const APEX = ["MASTER", "GRANDMASTER", "CHALLENGER"];

// A small shield in the tier colour with the division, plus tier name and LP.
export default function RankBadge({ tier, rank, lp, compact = false }) {
  const [color, label] = TIERS[tier] ?? ["#71717a", "Unranked"];
  const division = APEX.includes(tier) ? "" : rank;

  return (
    <span className="inline-flex items-center gap-2" title={`${label} ${division ?? ""} · ${lp ?? 0} LP`}>
      <svg viewBox="0 0 24 28" width="22" height="26" aria-hidden="true">
        <path
          d="M12 1.5 22 5v9.5c0 6-4.3 10.2-10 12-5.7-1.8-10-6-10-12V5z"
          fill={color}
          fillOpacity="0.16"
          stroke={color}
          strokeWidth="1.5"
        />
        <text x="12" y="17.5" textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>
          {division || label[0]}
        </text>
      </svg>
      <span className="leading-tight">
        <span className="block text-sm" style={{ color }}>
          {label} {division}
        </span>
        {!compact && lp != null && <span className="block text-xs text-zinc-400">{lp} LP</span>}
      </span>
    </span>
  );
}
