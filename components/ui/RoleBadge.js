// Softer, desaturated role colours.
const ROLE = {
  Top: ["TOP", "#d99a6c"],
  Jungler: ["JNG", "#7fbf94"],
  Mid: ["MID", "#a79bd6"],
  Bottom: ["BOT", "#d58aa8"],
  Support: ["SUP", "#6cb8c4"],
};

export default function RoleBadge({ role }) {
  const [short, color] = ROLE[role] ?? [String(role ?? "?").slice(0, 3).toUpperCase(), "#a1a1aa"];
  return (
    <span
      title={role}
      className="inline-flex h-5 min-w-[2.25rem] items-center justify-center rounded px-1.5 text-[10px] font-bold"
      style={{ color, backgroundColor: `${color}1f` }}
    >
      {short}
    </span>
  );
}
