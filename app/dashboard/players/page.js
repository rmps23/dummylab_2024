"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ModalDL from "@/components/lib/ModalDL";
import AddPlayer from "@/components/players/AddPlayer";
import TeamList from "@/components/teams/TeamList";

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
import { FaChartSimple, FaBan } from "react-icons/fa6";

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
      <TeamList></TeamList>

      <div className="pl-80 py-4">
        <ModalDL
          btn="Add Player"
          content={<AddPlayer onPlayerAdded={handlePlayerAdded} />}
        />
        <div className="py-4 flex flex-wrap w-full">
          {loading ? (
            <CircularProgress />
          ) : players.length > 0 ? (
            <>
              <div className="flex flex-wrap w-full -mx-4">
                {players.map((player, index) => {
                  const rank = player.rank || {};
                  const tier = rank.tier || "";
                  const rankName = rank.rank || "UNRANKED";
                  const points =
                    rank.leaguePoints !== undefined ? rank.leaguePoints : "-";
                  const imageSrc = tier
                    ? `https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/ranks/${capitalizeWord(
                        tier
                      )}.png`
                    : "https://fpwrnfdqzvztmakmrdnc.supabase.co/storage/v1/object/public/ranks/Unranked.png";

                  return (
                    <div key={index} className="w-1/2 px-4 mb-6">
                      <div className="border border-zinc-800 relative flex flex-col gap-4 items-center justify-between p-4 rounded-md">
                        <div className="flex justify-between w-full">
                          <div className="flex gap-4 items-center">
                            <div className="relative">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/14.11.1/img/profileicon/${player.icon}.png`}
                                height={60}
                                width={60}
                                alt=""
                                className="rounded-md border-2 border-teal-400"
                              />
                              <p className="absolute -bottom-2 w-full text-center">
                                <span className="bg-zinc-950 p-1 rounded-md border-t-2 border-r-2 border-l-2 border-teal-400 text-[10px]">
                                  {player.level}
                                </span>
                              </p>
                            </div>

                            <div>
                              <p className="text-zinc-300 text-md font-semibold mt-1">
                                {player.name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Image
                                  src={player.role.image_link}
                                  width={16}
                                  height={0}
                                  alt=""
                                />
                                <p className="text-xs text-zinc-400">
                                  {player.role.name}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center items-center bg-zinc-900/20 p-2">
                            <Image
                              src={imageSrc}
                              width={30}
                              height={0}
                              alt=""
                            />
                            <p className="text-[10px] text-neutral-300">
                              {tier ? capitalizeWord(tier) : ""} {rankName}
                            </p>
                            <span className="text-[10px] text-neutral-400">
                              {points}
                            </span>
                          </div>
                        </div>
                        <div className="w-full flex justify-between">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/dashboard/players/stats/${player.id}`}
                              className="text-neutral-300 text-xs border border-zinc-500 rounded-md py-1 px-2 flex items-center gap-2 hover:bg-zinc-800"
                            >
                              <FaChartSimple /> Stats
                            </Link>
                            <a
                              target="_blank"
                              href={generateOpggLink(player.riot_id)}
                              className="uppercase font-bold text-xs text-cyan-600 border border-zinc-500 rounded-md py-1 px-2 hover:bg-zinc-800"
                            >
                              OP.GG
                            </a>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              color="error"
                              onClick={() => {
                                setDeletePlayerId(player.id);
                                setOpenConfirmationDialog(true);
                              }}
                              className="text-neutral-300 text-xs border border-red-900 rounded-md py-1 px-2 flex items-center gap-2 hover:bg-zinc-800"
                            >
                              <FaBan /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
