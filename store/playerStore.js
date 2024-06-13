import { create } from "zustand";
import { fetchPlayers } from "@/hooks/fetchPlayers";
import { insertPlayer } from "@/hooks/insertPlayer";

export const playerStore = create((set) => ({
  players: [], // Initialize as an empty array
  loading: true,
  updatePlayers: (newPlayers) => set({ players: newPlayers || [] }), // Ensure newPlayers is not null
  setLoading: (isLoading) => set({ loading: isLoading }),
  getPlayers: async (teamID) => {
    set({ loading: true });
    try {
      const response = await fetchPlayers(teamID);
      set({ players: response || [], loading: false }); // Ensure response is not null
    } catch (error) {
      console.error("Failed to fetch players", error);
      set({ players: [], loading: false });
    }
  },
  refreshPlayers: async (teamID) => {
    try {
      const response = await fetchPlayers(teamID);
      set({ players: response || [] }); // Ensure response is not null
    } catch (error) {
      console.error("Failed to refresh players", error);
    }
  },
  addPlayer: async (playerName, role, riotID, userID, teamID) => {
    set({ loading: true });
    try {
      await insertPlayer(playerName, role, riotID, userID, teamID);
      const response = await fetchPlayers(teamID);
      set({ players: response || [], loading: false }); // Ensure response is not null
    } catch (error) {
      console.error("Failed to add player", error);
      set({ loading: false });
    }
  },
}));
