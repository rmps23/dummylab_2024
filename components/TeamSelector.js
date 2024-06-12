import React, { useState, useEffect } from "react";
import { FaSearch, FaChevronUp } from "react-icons/fa";
import Link from "next/link";
import { teamStore } from "@/store/teamStore";
import Modal from "./ui/Modal";
import { useParams } from "next/navigation";
import Dropdown from "./ui/Dropdown";
import { useInsertTeam } from "@/hooks/useInsertTeam";
import CircularProgress from "@mui/material/CircularProgress";

const TeamSelector = ({ user }) => {
  const teams = teamStore((state) => state.teams);
  const loading = teamStore((state) => state.loading);
  const getTeams = teamStore((state) => state.getTeams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const params = useParams();
  const paramTeamID = params.team_id;
  const { insertTeam, loading: insertLoading, error } = useInsertTeam();

  useEffect(() => {
    if (user?.id) {
      getTeams(user.id);
    }
  }, [user?.id, getTeams]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    if (teamName && selectedRegion) {
      await insertTeam(teamName, selectedRegion.value);
      setTeamName("");
      setSelectedRegion(null);
      handleCloseModal();
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTeamSelect = (teamID) => {
    if (teamID) {
      window.location.href = `/dashboard/${teamID}`;
    }
  };

  const regionOptions = [
    { value: "1", label: "AMERICAS" },
    { value: "2", label: "EUROPE" },
    { value: "3", label: "ASIA" },
    { value: "4", label: "SEA" },
  ];

  return (
    <>
      <div className="flex-col sm:flex hidden">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {teams.length > 0 ? (
              <div className="gap-2 flex flex-col">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="text-sm px-2 py-2 bg-zinc-950 rounded-md focus:outline-none text-zinc-400 pr-8 mb-2 w-full"
                  />
                  <div className="absolute right-4 top-3 text-gray-400 text-xs">
                    <FaSearch />
                  </div>
                </div>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/dashboard/${team.id}`}
                      className={`text-sm px-2 py-2 bg-zinc-950 rounded-md hover:bg-zinc-900 ${paramTeamID == team.id
                        ? "text-cyan-500 font-bold"
                        : "text-zinc-400"
                        }`}
                    >
                      {team.name}
                    </Link>
                  ))
                ) : (
                  <p>No teams found.</p>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleOpenModal}
                  className="text-sm px-2 py-1 bg-zinc-950 rounded-md hover:bg-zinc-900"
                >
                  Create Team
                </button>
                <Modal show={isModalOpen} onClose={handleCloseModal}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm uppercase">Team name</p>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="outline-none bg-zinc-950 p-2 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm uppercase">Region</p>
                      <Dropdown
                        options={regionOptions}
                        selected={selectedRegion}
                        onSelect={setSelectedRegion}
                      />
                    </div>
                    <div className="flex pt-4">
                      <button
                        className="bg-cyan-500 text-zinc-950 p-1 w-full rounded-md hover:bg-cyan-400"
                        onClick={handleSubmit}
                        disabled={insertLoading}
                      >
                        {insertLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                  </div>
                </Modal>
              </>
            )}
          </>
        )}
      </div>
      <div className="flex-col flex sm:hidden w-full">
        {loading ? (
          <div
            className="relative cursor-pointer px-2 py-2 bg-zinc-950 rounded-md text-zinc-400 w-full flex justify-between items-center text-center">
            <CircularProgress size={24} color="inherit" className="mx-auto" /></div>
        ) : (
          <>
            {teams.length > 0 ? (
              <div className="gap-2 flex flex-col">
                <div
                  className="relative cursor-pointer px-2 py-2 bg-zinc-950 rounded-md text-zinc-400 w-full flex justify-between items-center"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span>Select a team</span>
                  <FaChevronUp />
                </div>
                {dropdownOpen && (
                  <div className="absolute top-24 left-0 gap-2 flex p-2 flex-col bg-cyan-500 sm:bg-zinc-950 sm:mt-2 w-full max-h-52 overflow-y-auto z-10">
                    {filteredTeams.length > 0 ? (
                      filteredTeams.map((team) => (
                        <div
                          key={team.id}
                          className={`text-sm px-2 py-2 bg-zinc-950 rounded-md ${paramTeamID == team.id
                            ? "text-cyan-500 font-bold"
                            : "text-zinc-400"
                            }`}
                          onClick={() => handleTeamSelect(team.id)}
                        >
                          {team.name}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm px-2 py-2 text-zinc-400">
                        No teams found.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleOpenModal}
                  className="text-sm px-2 py-1 bg-zinc-950 rounded-md hover:bg-zinc-900"
                >
                  Create Team
                </button>
                <Modal show={isModalOpen} onClose={handleCloseModal}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm uppercase">Team name</p>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="outline-none bg-zinc-950 p-2 rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-sm uppercase">Region</p>
                      <Dropdown
                        options={regionOptions}
                        selected={selectedRegion}
                        onSelect={setSelectedRegion}
                      />
                    </div>
                    <div className="flex pt-4">
                      <button
                        className="bg-cyan-500 text-zinc-950 p-1 w-full rounded-md hover:bg-cyan-400"
                        onClick={handleSubmit}
                        disabled={insertLoading}
                      >
                        {insertLoading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                  </div>
                </Modal>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TeamSelector;
