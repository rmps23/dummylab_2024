"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ModalDL from "@/components/lib/ModalDL";
import AddPlayer from "@/components/players/AddPlayer";
import { getPlayers, deletePlayerByID } from "@/functions/Players";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { CircularProgress, Button } from "@mui/material";
import { supabase } from "@/supabase";
import Image from "next/image";
import Link from "next/link";
import { FaSquareXmark } from "react-icons/fa6";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletePlayerId, setDeletePlayerId] = useState(null); // To store the ID of the player to be deleted
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    const playersList = await getPlayers();
    setPlayers(playersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerAdded = () => {
    fetchPlayers();
  };

  const generateOpggLink = (riotId) => {
    const formattedRiotId = riotId.replace("#", "-");
    return `https://www.op.gg/summoners/euw/${formattedRiotId}`;
  };

  const handleConfirmDelete = async () => {
    await deletePlayerByID(deletePlayerId);
    handlePlayerAdded();
    setOpenConfirmationDialog(false); // Close the confirmation dialog
  };

  const handleCloseDialog = () => {
    setOpenConfirmationDialog(false); // Close the confirmation dialog without deleting
  };

  function capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return (
    <>
      <Navbar />
      <div className="pl-72 pr-8 py-8">
        <ModalDL
          btn="Create Player"
          content={<AddPlayer onPlayerAdded={handlePlayerAdded} />}
        />

        <div className="py-4 flex w-full">
          {loading ? (
            <CircularProgress />
          ) : players.length > 0 ? (
            <>
              <div className="flex flex-wrap w-full gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="w-full relative overflow-hidden"
                  >
                    <Image
                      src={player.role.image_link}
                      width={100}
                      height={0}
                      alt=""
                      className="absolute -z-10 saturate-0 opacity-20 left-2 -top-1"
                    ></Image>
                    <div className="bg-neutral-800/40 p-4 rounded-md flex justify-between item-center">
                      <div>
                        <p className="text-teal-600 font-bold text-xl ml-5">
                          {player.name}
                        </p>
                      </div>

                      <div className="flex justify-center items-center gap-4">
                        <div className="flex gap-2 justify-center items-center">
                          <Image
                            src={`https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/ranks/${capitalizeWord(
                              player.rank.tier
                            )}.png`}
                            width={40}
                            height={0}
                            alt=""
                            className=""
                          ></Image>
                          <p className="text-xs text-neutral-400">
                            {player.rank.tier} {player.rank.rank}
                            {" - "}
                            {player.rank.leaguePoints}
                          </p>
                        </div>
                        <a
                          target="_blank"
                          href={generateOpggLink(player.riot_id)}
                          className="py-1 px-2 bg-[#5383E8] rounded-md text-sm uppercase"
                        >
                          OP.GG
                        </a>
                        <Link
                          href={`/dashboard/players/stats/${player.id}`}
                          className="bg-teal-500 text-neutral-950 py-1 px-2 rounded-md text-sm uppercase"
                        >
                          Stats
                        </Link>
                        <Link
                          href={`/dashboard/players/${player.id}`}
                          className="bg-teal-500 text-neutral-950 py-1 px-2 rounded-md text-sm uppercase"
                        >
                          Match History
                        </Link>
                        <button
                          color="error"
                          onClick={() => {
                            setDeletePlayerId(player.id);
                            setOpenConfirmationDialog(true);
                          }}
                          className="text-2xl text-red-600"
                        >
                          <FaSquareXmark></FaSquareXmark>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Dialog
                open={openConfirmationDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Delete Player?"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this player?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmDelete} color="error" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <p>No players found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Players;
