import { create } from "zustand";

export const teamStore = create((set) => ({
  teams: [],

  setTeams: (teams) => set({ teams }),

  addTeam: (newTeam) => {
    set((state) => ({
      teams: [...state.teams, newTeam],
    }))
  },

  editTeamName: (team_id, newName) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === team_id ? { ...team, name: newName } : team
      ),
    })),

  removeTeam: (team_id) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== team_id),
    })),
}));
