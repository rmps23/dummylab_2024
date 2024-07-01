"use client";

import { FaUsers } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { userStore } from "@/store/userStore";
import { teamStore } from "@/store/teamStore";
import { fetchTeams } from "@/hooks/teams/fetchTeams";
import Modal from "@/components/ui/Modal";
import AddPlayer from "@/components/players/AddPlayer";
import { fetchPlayers } from "@/hooks/players/fetchPlayers";
import { playerStore } from "@/store/playerStore";
import EditPlayer from "@/components/players/EditPlayer";
import RemovePlayer from "@/components/players/RemovePlayer";
import Link from "next/link";

const Players = () => {
  const user = userStore((state) => state.user);
  const { teams, setTeams } = teamStore();
  const { players, setPlayers } = playerStore();

  const [loading, setLoading] = useState(true);
  const [createPlayerModal, setCreatePlayerModal] = useState(false);
  const [editPlayerModal, setEditPlayerModal] = useState(false);
  const [removePlayerModal, setRemovePlayerModal] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const fetchTeamsData = async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const data = await fetchTeams(user.id);
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayersData = async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const data = await fetchPlayers(user.id);
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsData();
    fetchPlayersData();
  }, [user]);

  const handleOpenCreate = () => {
    setCreatePlayerModal(true);
  };

  const handleCloseCreate = () => {
    setCreatePlayerModal(false);
  };

  const handleOpenEdit = (player) => {
    setCurrentPlayer(player);
    setEditPlayerModal(true);
  };

  const handleCloseEdit = () => {
    setEditPlayerModal(false);
    setCurrentPlayer(null);
  };

  const handleOpenRemove = (player) => {
    setCurrentPlayer(player);
    setRemovePlayerModal(true);
  };

  const handleCloseRemove = () => {
    setRemovePlayerModal(false);
    setCurrentPlayer(null);
  };

  return (
    <>
      <div className="flex items-center gap-6 w-full pb-4 mb-8 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <FaUsers className="bg-zinc-900 p-2 text-4xl rounded-md" />
          <span className="text-lg">Players</span>
        </div>
        <button
          onClick={handleOpenCreate}
          className="text-sm bg-zinc-50 text-zinc-950 px-2 py-1 rounded-md hover:bg-zinc-100"
        >
          Add Player
        </button>
        {user && (
          <Modal
            show={createPlayerModal}
            onClose={handleCloseCreate}
            content={
              <AddPlayer
                user_id={user.id}
                teams={teams}
                setCreatePlayerModal={setCreatePlayerModal}
              />
            }
          />
        )}
      </div>
      {players && players.length > 0 ? (
        <div className="flex flex-col max-w-3xl gap-2 p-4 rounded-md bg-zinc-900">
          {players.map((player) => (
            <div key={player.id} className="flex flex-col gap-2">
              <div className="flex gap-2 items-center justify-between">
                <span>{player.role_id.name} - {player.name}</span>
                <div className="flex items-center gap-2 text-right">
                  <Link href={`/dashboard/players/match_history/${player.id}`}>
                    Match History
                  </Link>
                  <Link href={`/dashboard/players/stats/${player.id}`}>Stats</Link>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenEdit(player)}>Edit</button>
                <button onClick={() => handleOpenRemove(player)}>Remove</button>
              </div>
            </div>
          ))}
          {currentPlayer && (
            <>
              <Modal
                show={editPlayerModal}
                onClose={handleCloseEdit}
                content={
                  <EditPlayer
                    player_name={currentPlayer.name}
                    player_id={currentPlayer.id}
                    teams={teams}
                    team_id={currentPlayer.team_id.id}
                    setEditPlayerModal={setEditPlayerModal}
                  />
                }
              />
              <Modal
                show={removePlayerModal}
                onClose={handleCloseRemove}
                content={
                  <RemovePlayer
                    player_name={currentPlayer.name}
                    player_id={currentPlayer.id}
                    setRemovePlayerModal={setRemovePlayerModal}
                  />
                }
              />
            </>
          )}
        </div>
      ) : (
        "No players found"
      )}
    </>
  );
};

export default Players;
