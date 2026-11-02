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
        <button className="bg-red-700 py-1 px-2 rounded-md" onClick={handleRemoveTeam}>
          Delete
        </button>
        <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={() => setRemoveTeamModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveTeam;
