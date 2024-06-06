import { fetchUser } from "@/hooks/fetchUser";
import { create } from "zustand";

export const userStore = create((set) => ({
  user: null,
  updateUser: (new_user) => set({ user: new_user }),
  getUser: async () => {
    if (userStore.getState().user === null) {
      const response = await fetchUser();
      set({ user: response });
    }
  },
}));
