import { create } from "zustand";

export const teamStore = create((set) => ({
  teams: [],

  setTeams: (teams) => set({ teams }),

  addTeam: (newTeam) => {
    set((state) => ({
      teams: [...state.teams, newTeam],
    }))
  },

  removeTeam: (team_id) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== team_id),
    })),
}));
