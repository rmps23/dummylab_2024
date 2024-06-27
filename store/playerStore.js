import { create } from "zustand";

export const playerStore = create((set) => ({
  players: [],

  setPlayers: (players) => set({ players }),

  addPlayer: (newPlayer) => {
    set((state) => ({
      players: [...state.players, newPlayer],
    }))
  },

}));
