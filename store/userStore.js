import { fetchUser } from "@/hooks/users";
import { create } from "zustand";

export const userStore = create((set, get) => ({
  user: null,
  userFetched: false,
  getUser: async () => {
    if (get().userFetched) return;
    const { user } = await fetchUser();
    set({ user, userFetched: true });
  },
  clearUser: () => set({ user: null, userFetched: false }),
}));

export const isDemo = (user) => user?.app_metadata?.is_demo === true;
