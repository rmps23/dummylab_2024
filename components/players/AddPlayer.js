"use client";

import { useState, useEffect } from "react";

const AddPlayer = ({ user_id, teams }) => {
  const [teamName, setTeamName] = useState("");

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

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await handleAddTeam();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p>Player Name</p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        placeholder="Insert team name..."
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        onKeyDown={handleKeyDown} // Handle Enter key press
      />
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
