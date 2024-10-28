import React from 'react';
import Link from 'next/link';

export const PlayerCard = ({ player }) => {
    return (
        <div key={player.id} className="border border-zinc-900 bg-zinc-800 p-4 rounded-md flex justify-between">
            <div className="flex gap-2 items-center justify-between">
                <span>
                    <span className="text-cyan-500">{player.name}</span> | {player.role_id.name}
                </span>
                <div className="flex items-center gap-2 text-right">
                    <Link href={`/dashboard/players/match_history/${player.id}`}>
                        Match History
                    </Link>
                    <Link href={`/dashboard/players/stats/${player.id}`}>
                        Stats
                    </Link>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(player)} className="">Edit</button>
                <button onClick={() => handleOpenRemove(player)}>Remove</button>
            </div>
        </div>
    )
}
