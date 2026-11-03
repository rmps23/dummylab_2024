"use client";

import { toast } from "react-toastify";
import { teamStore } from "@/store/teamStore";
import { playerStore } from "@/store/playerStore";
import { deleteTeam } from "@/hooks/teams";

const RemoveTeam = ({ team_name, team_id, setRemoveTeamModal }) => {
  const removeTeam = teamStore((s) => s.removeTeam);

  async function handleRemoveTeam() {
    try {
      await deleteTeam(team_id);
      removeTeam(team_id);
      // Players and events of the team are removed by the database (cascade).
      playerStore.setState((s) => ({ players: s.players.filter((p) => p.team_id !== team_id) }));
      setRemoveTeamModal(false);
    } catch (error) {
      toast.error(`Could not delete the team: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="mx-auto text-center">
        Delete <b>{team_name}</b>? Its players, events and stats are deleted too.
      </p>
      <div className="flex gap-4 justify-center">
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-600/90 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-30" onClick={handleRemoveTeam}>
          Delete
        </button>
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-zinc-100 hover:bg-white/10" onClick={() => setRemoveTeamModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveTeam;
