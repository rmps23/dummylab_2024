// Recent results as small bars, oldest on the left. `results` is an array of booleans (true = win).
export default function FormPips({ results, size = "md" }) {
  if (!results.length) return <span className="text-xs text-zinc-400">No games yet</span>;
  const h = size === "sm" ? "h-3.5 w-1.5" : "h-5 w-2";
  const wins = results.filter(Boolean).length;
  return (
    <span
      className="inline-flex items-center gap-[3px]"
      role="img"
      aria-label={`Last ${results.length} games: ${wins} wins, ${results.length - wins} losses`}
    >
      {[...results].reverse().map((win, i) => (
        <span key={i} className={`${h} rounded-sm ${win ? "bg-win" : "bg-loss/80"}`} />
      ))}
    </span>
  );
}
