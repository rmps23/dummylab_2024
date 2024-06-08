import { useState } from "react";
import { supabase } from "@/supabase";
import { teamStore } from "@/store/teamStore";

export const useInsertTeam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateTeams = teamStore((state) => state.updateTeams);
  const teams = teamStore((state) => state.teams);
  const refreshTeams = teamStore((state) => state.refreshTeams);

  const insertTeam = async (teamName, region) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: teamName, region }]);

      if (error) throw error;

      // Refresh the global state with the updated teams list
      await refreshTeams();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    insertTeam,
    loading,
    error,
  };
};
