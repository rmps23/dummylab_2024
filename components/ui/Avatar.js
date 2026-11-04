// Muted, flat tile colours (no gradients). Picked from the name so each player keeps theirs.
const TILES = [
  "bg-[#5aa9b5]",
  "bg-[#b58a5a]",
  "bg-[#7fae86]",
  "bg-[#c4806f]",
  "bg-[#8b95c4]",
  "bg-[#b8a15e]",
];

// Initial in a coloured tile.
export default function Avatar({ name = "?", size = 40, className = "" }) {
  const hash = [...String(name)].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg font-bold text-black/75 ${TILES[hash % TILES.length]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {String(name).trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
