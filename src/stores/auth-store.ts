import { create } from "zustand";
import { User } from "../types/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isInitialized: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL !== undefined) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://localhost:8080";
};

const fetchUserProfile = async (token: string): Promise<User> => {
  const BASE_URL = getBaseUrl();

  const response = await fetch(`${BASE_URL}/api/v1/users/me`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile from backend");
  }

  const res = await response.json();
  if (res && res.success && res.data) {
    const data = res.data;
    return {
      id: Number(data.id),
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      username: data.username,
      role: data.role || "USER",
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.username || "User",
      email: data.username,
      avatarUrl: undefined
    };
  }
  throw new Error("Invalid response format from backend");
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: typeof window !== "undefined" ? localStorage.getItem("xitlar_token") : null,
  isInitialized: false,
  
  login: async (token: string) => {
    if (!token) {
      throw new Error("No token provided");
    }

    // Try to fetch profile to verify token before storing it
    const loadedUser = await fetchUserProfile(token);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("xitlar_token", token);
    }
    
    set({
      token,
      user: loadedUser,
      isAuthenticated: true,
      isInitialized: true
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("xitlar_token");
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true
    });
  },

  initialize: async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("xitlar_token");
      if (token) {
        try {
          const loadedUser = await fetchUserProfile(token);
          set({
            token,
            user: loadedUser,
            isAuthenticated: true,
            isInitialized: true
          });
        } catch (err) {
          console.warn("Failed to initialize session, clearing invalid token:", err);
          localStorage.removeItem("xitlar_token");
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isInitialized: true
          });
        }
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isInitialized: true
        });
      }
    }
  }
}));
