import { create } from "zustand";

import { disconnectSocket } from "@/lib/socket";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("token");
    disconnectSocket();
    set({ user: null, token: null });
  },
}));
