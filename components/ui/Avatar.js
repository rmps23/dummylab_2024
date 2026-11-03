const GRADIENTS = [
  "from-cyan-400 to-sky-600",
  "from-violet-400 to-fuchsia-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-600",
  "from-rose-400 to-pink-600",
  "from-indigo-400 to-blue-600",
];

// Initial in a gradient tile; the gradient is picked from the name so it stays stable.
export default function Avatar({ name = "?", size = 40, className = "" }) {
  const hash = [...String(name)].reduce((n, ch) => n + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-zinc-950 ${GRADIENTS[hash % GRADIENTS.length]} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {String(name).trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
