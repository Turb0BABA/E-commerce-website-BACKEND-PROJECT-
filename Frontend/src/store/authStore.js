import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,

  // set user data after login/register
  setUser: (user) => set({ user }),

  // clear user on logout
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));

export default useAuthStore;
