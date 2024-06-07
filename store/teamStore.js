import { fetchTeams } from "@/hooks/fetchTeams";
import { create } from "zustand";

export const teamStore = create((set) => ({
  teams: [],
  loading: true,
  updateTeams: (newTeams) => set({ teams: newTeams }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  getTeams: async (userId) => {
    set({ loading: true });
    try {
      const response = await fetchTeams(userId);
      set({ teams: response, loading: false });
    } catch (error) {
      console.error("Failed to fetch teams", error);
      set({ teams: [], loading: false });
    }
  },
}));
