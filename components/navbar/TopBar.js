import React, { useState, useEffect } from "react";
import { UserTeams } from "@/functions/teams/Teams";
import { supabase } from "@/supabase";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";

const TopBar = () => {
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user.id;
    const result = await UserTeams(userId);
    setTeams(result);
    setLoading(false);
  };

  useEffect(() => {
    // Redirect to create_team page if the user has no teams
    if (!loading && (!teams || teams.length === 0)) {
      router.push("/dashboard/create_team");
    }
  }, [loading, teams, router]);

  return (
    <div className="flex p-4 bg-zinc-900 border-b border-neutral-900 gap-4 justify-between items-center">
      <div className="flex justify-start items-center gap-4">
        <p className="flex uppercase items-center text-xl border-r border-zinc-700 pr-4">
          Dummy<span className="text-cyan-400">Lab</span>
        </p>
        {loading ? (
          <CircularProgress color="inherit" size={14} /> // Show loading indicator while fetching data
        ) : (
          teams && (
            <select className="bg-zinc-800 p-2 text-left min-w-40 rounded-md cursor-pointer">
              {teams.map((team) => (
                <option key={team.id} value={team.id} className="p-2">
                  {team.name}
                </option>
              ))}
            </select>
          )
        )}
      </div>
      <div className="flex items-center justify-center"></div>
    </div>
  );
};

export default TopBar;
