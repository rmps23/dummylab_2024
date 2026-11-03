"use client";

import { toast } from "react-toastify";
import { playerStore } from "@/store/playerStore";
import { deletePlayer } from "@/hooks/players";

const RemovePlayer = ({ player, setRemovePlayerModal }) => {
  const removePlayer = playerStore((s) => s.removePlayer);

  async function handleRemovePlayer() {
    try {
      await deletePlayer(player.id);
      removePlayer(player.id);
      setRemovePlayerModal(false);
    } catch (error) {
      toast.error(`Could not delete the player: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="mx-auto text-center">
        Delete <b>{player.name}</b>? Their match history is deleted too.
      </p>
      <div className="flex gap-4 justify-center">
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-600/90 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-30" onClick={handleRemovePlayer}>
          Delete
        </button>
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-zinc-100 hover:bg-white/10" onClick={() => setRemovePlayerModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemovePlayer;
