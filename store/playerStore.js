import { create } from "zustand";

export const playerStore = create((set) => ({
  players: [],

  setPlayers: (players) => set({ players }),

  addPlayer: (newPlayer) => {
    set((state) => ({
      players: [...state.players, newPlayer],
    }))
  },

  editPlayerStore: (newName, team_id, player_id) =>
    set((state) => ({
      players: state.players.map((player) =>
        player.id === player_id ? { ...player, name: newName, team_id: team_id } : player
      ),
    })),
}));
