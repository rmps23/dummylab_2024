import Donut from "@/components/ui/Donut";
import FormPips from "@/components/ui/FormPips";
import RankBadge from "@/components/ui/RankBadge";
import RoleBadge from "@/components/ui/RoleBadge";

const EVENTS = [
  ["04", "Team practice", "Training", "bg-brand", [0, 1, 2, 3, 3]],
  ["07", "Scrim vs Night Owls", "Scrim", "bg-amber-400", [0, 0, 1, 3, 4]],
  ["12", "Playoffs: Round 1", "Match", "bg-emerald-400", [0, 1, 1, 2, 3]],
];
const COLOR = ["bg-win", "bg-amber-400", "bg-loss", "bg-zinc-600", "bg-win"];

// A static illustration of the dashboard, built from the real components with sample numbers.
export default function Preview() {
  return (
    <div
      role="img"
      aria-label="Preview of the DummyLab dashboard: win rate, recent form, upcoming events with player availability and ranks"
      className="relative rounded-xl border border-line bg-panel p-4 shadow-card"
    >
      <div className="flex flex-wrap items-center gap-5 rounded-xl bg-black/20 p-4">
        <Donut value={58} size={88} />
        <div>
          <div className="eyebrow">Last 30 days</div>
          <div className="text-2xl font-bold">
            <span className="text-win">58W</span> <span className="text-zinc-500">/</span> <span className="text-loss">42L</span>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1">Recent form</div>
          <FormPips results={[true, true, false, true, true, false, true, true, true, false]} size="sm" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-black/20 p-3">
          <div className="eyebrow mb-2">Upcoming events</div>
          <ul className="flex flex-col gap-2">
            {EVENTS.map(([day, title, type, dot, answers]) => (
              <li key={title} className="flex items-center gap-2">
                <span className="w-9 rounded-md bg-white/[0.06] py-0.5 text-center text-sm font-bold">{day}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{title}</span>
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {type}
                  </span>
                </span>
                <span className="flex gap-1">
                  {answers.map((a, i) => (
                    <span key={i} className={`h-2 w-2 rounded-full ${COLOR[a]}`} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-black/20 p-3">
          <div className="eyebrow mb-2">Solo queue</div>
          <ul className="flex flex-col gap-2">
            {[
              ["Rift", "Top", "EMERALD", "II", 54],
              ["Nova", "Mid", "EMERALD", "I", 88],
              ["Bolt", "Bottom", "DIAMOND", "III", 40],
            ].map(([name, role, tier, rank, lp]) => (
              <li key={name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {name} <RoleBadge role={role} />
                </span>
                <RankBadge tier={tier} rank={rank} lp={lp} compact />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
