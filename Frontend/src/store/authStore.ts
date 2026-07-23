import { create } from "zustand";
import { persist } from "zustand/middleware";
import socket from "../lib/socket";
import type { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setAuth: (token, user) => {
        set({ token, user });
        // Connect socket and join user's room
        socket.connect();
        socket.emit("join", user.id);
      },
      logout: () => {
        set({ token: null, user: null });
        socket.disconnect();
      },
    }),
    { name: "roomly-auth", partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
