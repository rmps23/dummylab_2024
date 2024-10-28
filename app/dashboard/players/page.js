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
import { PlayerCard } from "@/components/players/PlayerCard";

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
    if (!user) return;

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
    if (!user) return;

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

  const handleOpenCreate = () => setCreatePlayerModal(true);
  const handleCloseCreate = () => setCreatePlayerModal(false);

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
      <div className="flex items-center gap-6 w-full pt-4 px-6 pb-4 border-b border-zinc-900 bg-cyan-600">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {players && players.length > 0 ? (
          players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))
        ) : (
          <p>No players found</p>
        )}
      </div>
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
    </>
  );
};

export default Players;
