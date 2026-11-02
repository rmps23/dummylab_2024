import { create } from "zustand";

export const playerStore = create((set) => ({
  players: [],
  loaded: false,

  setPlayers: (players) => set({ players, loaded: true }),
  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  updatePlayer: (player) =>
    set((state) => ({ players: state.players.map((p) => (p.id === player.id ? player : p)) })),
  removePlayer: (player_id) => set((state) => ({ players: state.players.filter((p) => p.id !== player_id) })),
}));
