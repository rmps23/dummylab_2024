"use client";

import { useEffect, useState, useRef } from "react";
import { TeamRegions, InsertTeam } from "@/functions/regions/Regions";
import { CircularProgress } from "@mui/material";
import { ToastContainer, Zoom, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTeam = () => {
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const teamNameRef = useRef();

  const fetchTeamRegions = async () => {
    setIsLoading(true);
    try {
      const teamRegions = await TeamRegions();
      setRegions(teamRegions);
    } catch (error) {
      toast.error("Failed to fetch team regions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamRegions();
  }, []);

  const handleRegionSelect = (index) => {
    setSelectedRegionIndex(index);
  };

  const handleTeamInsert = async () => {
    setIsInserting(true);
    const teamName = teamNameRef.current.value;
    if (!teamName) {
      toast.error("Team name cannot be empty");
      setIsInserting(false);
      return;
    }
    if (selectedRegionIndex === null) {
      toast.error("Please select a region");
      setIsInserting(false);
      return;
    }

    try {
      await InsertTeam(teamName, regions[selectedRegionIndex].id);
      toast.success("Team created successfully");
    } catch (error) {
      toast.error("Failed to create team");
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Zoom}
      />
      <div className="mb-10">
        <p className="mb-2">Team Name</p>
        <input
          ref={teamNameRef}
          className="w-full p-2 rounded-md bg-zinc-950 text-center"
          placeholder="Insert your team name..."
        />
      </div>
      <p className="flex">Region</p>
      <div className="flex flex-col sm:flex-row gap-10">
        {isLoading ? (
          <CircularProgress color="inherit" />
        ) : (
          regions.map((region, index) => (
            <div
              key={index}
              className={`p-2 sm:w-1/4 rounded-md cursor-pointer hover:opacity-80 transition-all ease-in-out duration-100 outline-1 outline-zinc-700 outline outline-offset-4 text-center ${
                selectedRegionIndex === index
                  ? "bg-cyan-400 text-zinc-950"
                  : "bg-zinc-950 text-zinc-300"
              }`}
              onClick={() => handleRegionSelect(index)}
            >
              <input
                type="radio"
                id={region.slug}
                value={region.id}
                checked={selectedRegionIndex === index}
                onChange={() => handleRegionSelect(index)}
                name="region"
                className="hidden"
              />
              {region.name}
            </div>
          ))
        )}
      </div>
      <button
        className="bg-cyan-400 text-zinc-950 py-2 px-6 mt-14 rounded-md text-md transition-all ease-in-out hover:opacity-80"
        onClick={handleTeamInsert}
        disabled={isInserting}
      >
        {isInserting ? (
          <CircularProgress color="inherit" size={12} />
        ) : (
          "Confirm"
        )}
      </button>
    </div>
  );
};

export default CreateTeam;
