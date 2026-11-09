// Tints are flat, low-saturation tiles; the tint is picked from the name so it stays stable.
const TINTS = [
  ["#4AC0DE", "#0B3340"],
  ["#3DD6A0", "#0A3326"],
  ["#F5B84B", "#3A2A08"],
  ["#FF6B7A", "#3F131A"],
  ["#8EA2FF", "#1A2250"],
  ["#C9D4DC", "#1D2F3E"],
];

export default function Avatar({ name = "?", size = 40, className = "" }) {
  const hash = [...String(name)].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  const [fg, bg] = TINTS[hash % TINTS.length];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42, color: fg, backgroundColor: bg, borderColor: `${fg}55` }}
    >
      {String(name).trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
