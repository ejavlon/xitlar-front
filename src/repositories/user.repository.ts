import { User } from "../types/user";
import { useAuthStore } from "../stores/auth-store";
import { api } from "../lib/api/client";

export interface UserRepository {
  getCurrentUser(): Promise<User>;
}

export class ApiUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User> {
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated && authState.user) {
      return authState.user;
    }

    // Fallback: try fetching from backend /api/v1/users/me if token exists
    try {
      const data = await api.get<{ id: number; firstName: string; lastName: string; username: string; role: any }>("/api/v1/users/me");
      if (data) {
        return {
          id: data.id,
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          username: data.username,
          role: data.role || "USER",
          email: `${data.username}@xitlar.uz`,
        };
      }
    } catch {
      // not logged in
    }

    throw new Error("No authenticated user session active.");
  }
}

export const userRepository: UserRepository = new ApiUserRepository();
