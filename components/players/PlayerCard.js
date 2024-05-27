"use client";

import { useState } from "react";
import Link from "next/link";

const PlayerCard = ({ players }) => {
  const [deletePlayerId, setDeletePlayerId] = useState(null); // To store the ID of the player to be deleted
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const handleDeletePlayer = async (uid) => {
    setDeletePlayerId(uid); // Set the ID of the player to be deleted
    setOpenConfirmationDialog(true); // Open the confirmation dialog
  };

  return (
    <>
      {players.map((player) => (
        <div
          key={player.id}
          sx={{
            "&:last-child td, &:last-child th": { border: 0 },
          }}
        >
          {player.name}
          {player.role.name}
          <Link
            href={"#"}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 p-1 rounded-sm hover:"
          >
            OP.GG
          </Link>
          <div className="flex gap-4 justify-center">
            <span
              variant="contained"
              color="error"
              onClick={() => handleDeletePlayer(player.id)}
              size="small"
            >
              Delete
            </span>
            <span variant="contained" color="info" size="small">
              <Link href={`/dashboard/players/${player.id}`}>View</Link>
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default PlayerCard;
