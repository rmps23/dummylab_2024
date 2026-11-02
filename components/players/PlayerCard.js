import Link from "next/link";
import { FaPen, FaTrash } from "react-icons/fa6";

export const PlayerCard = ({ player, teamName, onEdit, onRemove }) => (
  <div className="border border-zinc-800 bg-zinc-800 p-4 rounded-md flex flex-col gap-3">
    <div className="flex justify-between gap-2">
      <div className="min-w-0">
        <div className="text-cyan-400 truncate">{player.name}</div>
        <div className="text-xs text-zinc-400 truncate">
          {player.role?.name} · {teamName} · {player.riot_id}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button aria-label="Edit player" onClick={() => onEdit(player)} className="text-sm p-2 rounded-md bg-zinc-900">
          <FaPen />
        </button>
        <button aria-label="Delete player" onClick={() => onRemove(player)} className="text-sm p-2 rounded-md bg-zinc-900">
          <FaTrash />
        </button>
      </div>
    </div>
    <div className="flex gap-3 text-sm">
      <Link className="text-zinc-200 underline-offset-2 hover:underline" href={`/dashboard/players/match_history/${player.id}`}>
        Match history
      </Link>
      <Link className="text-zinc-200 underline-offset-2 hover:underline" href={`/dashboard/analytics?player=${player.id}`}>
        Stats
      </Link>
    </div>
  </div>
);
