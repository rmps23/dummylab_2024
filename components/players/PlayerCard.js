import Link from "next/link";
import { FaLink, FaNoteSticky, FaPen, FaTrash } from "react-icons/fa6";
import Avatar from "@/components/ui/Avatar";
import RoleBadge from "@/components/ui/RoleBadge";
import RankBadge from "@/components/ui/RankBadge";
import FormPips from "@/components/ui/FormPips";

const iconBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm text-zinc-300 transition hover:bg-white/[0.08]";
const link =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/10";

// `rank` is the solo queue snapshot (or undefined) and `form` the last results, newest first.
export const PlayerCard = ({ player, teamName, rank, form = [], onEdit, onRemove, onInvite, onNotes }) => (
  <article className="animate-rise flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-panel/80 p-4 shadow-card transition hover:border-brand/30">
    <div className="flex items-start gap-3">
      <Avatar name={player.name} size={46} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="break-words text-lg font-bold leading-tight">{player.name}</h2>
          <RoleBadge role={player.role?.name} />
        </div>
        <p className="mt-0.5 truncate text-xs text-zinc-400">
          {player.riot_id || "No Riot ID"} · {teamName}
        </p>
      </div>
      <div className="-mr-1 flex shrink-0">
        <button aria-label={`Availability link for ${player.name}`} title="Availability link" onClick={() => onInvite(player)} className={iconBtn}>
          <FaLink />
        </button>
        <button aria-label={`Notes and goals for ${player.name}`} title="Notes and goals" onClick={() => onNotes(player)} className={iconBtn}>
          <FaNoteSticky />
        </button>
        <button aria-label={`Edit ${player.name}`} onClick={() => onEdit(player)} className={iconBtn}>
          <FaPen />
        </button>
        <button aria-label={`Delete ${player.name}`} onClick={() => onRemove(player)} className={iconBtn}>
          <FaTrash />
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
      {rank ? <RankBadge tier={rank.tier} rank={rank.rank} lp={rank.lp} /> : <span className="text-sm text-zinc-400">Unranked</span>}
      <FormPips results={form} size="sm" />
    </div>

    <div className="flex gap-2">
      <Link className={link} href={`/dashboard/players/match_history/${player.id}`}>
        Match history
      </Link>
      <Link className={link} href={`/dashboard/analytics?player=${player.id}`}>
        Stats
      </Link>
    </div>
  </article>
);
