import { fetchUser } from "@/hooks/fetchUser";
import { create } from "zustand";

export const userStore = create((set) => ({
  user: null,
  updateUser: (new_user) => set({ user: new_user, userFetched: true }),
  getUser: async () => {
    const { user, userFetched } = userStore.getState();
    if (!user && !userFetched) {
      const response = await fetchUser();
      set({ user: response.user, userFetched: true });
    }
  },
}));
