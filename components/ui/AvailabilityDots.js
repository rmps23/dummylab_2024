// One dot per player: green = available, amber = maybe, red = unavailable, grey = pending.
import { statusFor } from "@/lib/availability";

const COLOR = { available: "bg-win", maybe: "bg-amber-400", unavailable: "bg-loss", pending: "bg-zinc-600" };

export default function AvailabilityDots({ event, players }) {
  if (!players.length) return null;
  const yes = players.filter((p) => statusFor(event, p.id) === "available").length;
  return (
    <span className="inline-flex items-center gap-2" role="img" aria-label={`${yes} of ${players.length} available`}>
      <span className="inline-flex gap-1">
        {players.map((p) => (
          <span key={p.id} className={`h-2 w-2 rounded-full ${COLOR[statusFor(event, p.id)]}`} />
        ))}
      </span>
      <span className={`text-xs font-bold ${yes >= 5 ? "text-win" : "text-amber-400"}`}>
        {yes}/{players.length}
      </span>
    </span>
  );
}
