import Link from "next/link";
import { FaPen, FaTrash } from "react-icons/fa6";

const iconButton = "flex h-11 w-11 items-center justify-center rounded-md bg-zinc-900 text-sm hover:bg-zinc-700";
const link = "inline-flex min-h-11 items-center rounded-md px-2 text-sm text-zinc-200 hover:bg-zinc-700";

export const PlayerCard = ({ player, teamName, onEdit, onRemove }) => (
  <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-800 p-4">
    <div className="flex justify-between gap-2">
      <div className="min-w-0">
        <div className="truncate text-cyan-400">{player.name}</div>
        <div className="truncate text-xs text-zinc-400">
          {player.role?.name} · {teamName} · {player.riot_id || "No Riot ID"}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button aria-label={`Edit ${player.name}`} onClick={() => onEdit(player)} className={iconButton}>
          <FaPen />
        </button>
        <button aria-label={`Delete ${player.name}`} onClick={() => onRemove(player)} className={iconButton}>
          <FaTrash />
        </button>
      </div>
    </div>
    <div className="flex gap-1">
      <Link className={link} href={`/dashboard/players/match_history/${player.id}`}>
        Match history
      </Link>
      <Link className={link} href={`/dashboard/analytics?player=${player.id}`}>
        Stats
      </Link>
    </div>
  </div>
);
