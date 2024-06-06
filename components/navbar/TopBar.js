'use client'

import React, { useState, useEffect } from "react";
import { UserTeams } from "@/functions/teams/Teams";
import { supabase } from "@/supabase";
import { useParams, useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Modal from "../utils/Modal";
import CreateTeam from "../teams/CreateTeam";
import Logout from "../auth/Logout";
import { CircularProgress } from '@mui/material';

const TopBar = (setNavteams) => {
  const [teams, setTeams] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [teamSelected, setTeamSelected] = useState(null);
  const [loadingSelector, setLoadingSelector] = useState(true); // Set initial loading state to true

  const router = useRouter();
  const params = useParams();
  const path = usePathname();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    fetchUserTeams();
  }, []);

  useEffect(() => {
    if (params.team_id) {
      setTeamSelected(params.team_id);
    }
  }, [params]);

  const fetchUserTeams = async () => {
    setLoadingSelector(true); // Set loading state to true before fetching
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user.id;
    const result = await UserTeams(userId);

    if (path == "/dashboard") {
      if (result.length > 0) {
        router.push(`/dashboard/${result[0].id}`);
      }
    }
    setTeams(result);
    setNavteams(result);
    setLoadingSelector(false); // Set loading state to false after fetching
  };

  function handleTeam(team_id) {
    setTeamSelected(team_id);
    router.push(`/dashboard/${team_id}`);
  }

  return (
    <>
      <div className="flex h-14 px-4 bg-zinc-900 gap-4 justify-between items-center border-b border-neutral-950 w-full">
        <div className="flex justify-start items-center gap-4">
          <p className="flex uppercase items-center text-xl border-r border-zinc-700 pr-4">
            Dummy<span className="text-cyan-400">Lab</span>
          </p>
          {loadingSelector ? ( // Check loading state
            <div className="flex justify-center items-center p-2 min-w-40 bg-zinc-800 rounded-md"><CircularProgress size={14} color="inherit" /></div>
          ) : teams && teams.length > 0 ? (
            <select
              className="bg-zinc-800 p-1 text-left min-w-40 rounded-md cursor-pointer"
              value={teamSelected}
              onChange={(e) => handleTeam(e.target.value)}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id} className="p-2">
                  {team.name}
                </option>
              ))}
            </select>
          ) : (
            <div>
              <button className="text-cyan-400 text-sm" onClick={openModal}>
                Create Team
              </button>
              <Modal show={showModal} onClose={closeModal}>
                <CreateTeam />
              </Modal>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center">
          <Logout />
        </div>
      </div>
    </>
  );
};

export default TopBar;
