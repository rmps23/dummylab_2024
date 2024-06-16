import { create } from "zustand";

export const playerStore = create((set) => ({
  players: [],

  // Action to add a new player
  addPlayer: (newPlayer) => set((state) => ({
    players: [...state.players, newPlayer]
  })),

  // Optional: Action to remove a player (if needed)
  removePlayer: (playerId) => set((state) => ({
    players: state.players.filter(player => player.id !== playerId)
  }))
}));