import { create } from "zustand";

// What the signed-in account may do (see /api/features). `loaded` avoids flashing "disabled" states.
export const featureStore = create((set, get) => ({
  riot: false,
  demo: false,
  plan: "free",
  billing: false,
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const response = await fetch("/api/features");
      if (response.ok) {
        const { riot, demo, plan, billing } = await response.json();
        set({ riot, demo, plan, billing, loaded: true });
        return;
      }
    } catch {}
    set({ loaded: true });
  },

  reset: () => set({ riot: false, demo: false, plan: "free", billing: false, loaded: false }),
}));
