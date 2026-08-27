import { create } from "zustand";
import { User } from "../types/user";
import { mockUser } from "../mock/users";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData?: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: mockUser,
  isAuthenticated: true,
  login: (userData) =>
    set({
      user: userData || mockUser,
      isAuthenticated: true
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false
    })
}));
