import { create } from "zustand";
import { fetchPlayers } from "@/hooks/fetchPlayers";
import { insertPlayer } from "@/hooks/insertPlayer";

export const playerStore = create((set) => ({
  players: [],
  loading: true,
  updatePlayers: (newPlayers) => set({ players: newPlayers }),
  setLoading: (isLoading) => set({ loading: isLoading }),
  getPlayers: async (teamID) => {
    set({ loading: true });
    try {
      const response = await fetchPlayers(teamID);
      set({ players: response, loading: false });
    } catch (error) {
      console.error("Failed to fetch players", error);
      set({ players: [], loading: false });
    }
  },
  refreshPlayers: async (teamID) => {
    try {
      const response = await fetchPlayers(teamID);
      set({ players: response });
    } catch (error) {
      console.error("Failed to refresh players", error);
    }
  },
  addPlayer: async (playerName, role, riotID, userID, teamID) => {
    set({ loading: true });
    try {
      await insertPlayer(playerName, role, riotID, userID, teamID);
      const response = await fetchPlayers(teamID);
      set({ players: response, loading: false });
    } catch (error) {
      console.error("Failed to add player", error);
      set({ loading: false });
    }
  },
}));
