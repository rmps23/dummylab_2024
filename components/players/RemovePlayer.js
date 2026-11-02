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
        <button className="bg-red-700 py-1 px-2 rounded-md" onClick={handleRemovePlayer}>
          Delete
        </button>
        <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={() => setRemovePlayerModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemovePlayer;
