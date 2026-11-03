const ROLE = {
  Top: ["TOP", "#fb923c"],
  Jungler: ["JNG", "#34d399"],
  Mid: ["MID", "#a78bfa"],
  Bottom: ["BOT", "#f472b6"],
  Support: ["SUP", "#22d3ee"],
};

export default function RoleBadge({ role }) {
  const [short, color] = ROLE[role] ?? [String(role ?? "?").slice(0, 3).toUpperCase(), "#a1a1aa"];
  return (
    <span
      title={role}
      className="inline-flex h-5 min-w-[2.25rem] items-center justify-center rounded px-1.5 text-[10px] font-bold tracking-wider"
      style={{ color, backgroundColor: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}40` }}
    >
      {short}
    </span>
  );
}
