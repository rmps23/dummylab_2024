import { create } from "zustand";

export const teamStore = create((set) => ({
  teams: [],
  loaded: false,
  activeTeamId: null,

  setTeams: (teams) =>
    set((state) => {
      let saved = null;
      try {
        saved = Number(localStorage.getItem("activeTeamId")) || null;
      } catch {}
      const preferred = [state.activeTeamId, saved].find((id) => teams.some((t) => t.id === id));
      return { teams, loaded: true, activeTeamId: preferred ?? teams[0]?.id ?? null };
    }),

  setActiveTeam: (id) => {
    try {
      localStorage.setItem("activeTeamId", String(id));
    } catch {}
    set({ activeTeamId: id });
  },

  addTeam: (team) =>
    set((state) => ({
      teams: [...state.teams, team],
      activeTeamId: state.activeTeamId ?? team.id,
    })),

  editTeamName: (team_id, name) =>
    set((state) => ({ teams: state.teams.map((t) => (t.id === team_id ? { ...t, name } : t)) })),

  removeTeam: (team_id) =>
    set((state) => {
      const teams = state.teams.filter((t) => t.id !== team_id);
      return {
        teams,
        activeTeamId: state.activeTeamId === team_id ? teams[0]?.id ?? null : state.activeTeamId,
      };
    }),
}));
