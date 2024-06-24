"use client";

import { useState, useEffect } from "react";

const AddPlayer = ({ user_id, teams }) => {
  const [playerRegion, setPlayerRegion] = useState();

  const regions = [
    "AMERICAS",
    "ASIA",
    "EUROPE"
  ];

  useEffect(() => {
    // const response = await fetchTeams(user_id);
  }, []);

  async function handleAddTeam() {
    // try {
    //   const response = await insertTeam(teamName, user_id);
    //   addTeam(response);
    // } catch (error) {
    //   console.error("Error adding team:", error);
    // } finally {
    //   setAddTeamModal(false);
    //   setTeamName("");
    // }
    console.log(teams);
  }

  async function verifyPlayer() {
    console.log("teste");
  }

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleAddTeam();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p>Player Name</p>
        <input
          type="text"
          className="bg-zinc-900 p-2 rounded-md outline-none"
          placeholder="Insert team name..."
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          onKeyDown={handleKeyDown} // Handle Enter key press
        />
      </div>
      <div className="bg-zinc-900 p-4 rounded-md">
        <div className="flex flex-col gap-4">
          <p>Riot ID</p>
          <div className="flex space-x-2">
            <input
              type="text"
              className="bg-zinc-950 p-2 rounded-md outline-none flex-1 min-w-0"
              placeholder="Game Name"
            />
            <span className="flex items-center justify-center">#</span>
            <input
              type="text"
              className="bg-zinc-950 p-2 rounded-md outline-none flex-1 min-w-0 max-w-24"
              placeholder="Tag Line"
            />
          </div>
          <div className="flex flex-col">
            <select className="p-2 rounded-md bg-zinc-950 cursor-pointer">
              {regions.map((region, index) => (
                <option key={index} value={index}>{region}</option>
              ))}
            </select>
          </div>
          <button
            className="bg-zinc-200 text-zinc-950 p-1 rounded-md"
            onClick={verifyPlayer}
          >
            Verify Player
          </button>

          <span>----------------</span>


        </div>
      </div>
      team and role missing
      <button
        className="bg-zinc-200 text-zinc-950 p-1 rounded-md"
        onClick={handleAddTeam}
      >
        Confirm
      </button>
    </div>
  );
};

export default AddPlayer;
