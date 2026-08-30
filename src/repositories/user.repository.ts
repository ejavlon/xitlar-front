import { User } from "../types/user";
import { useAuthStore } from "../stores/auth-store";

export interface UserRepository {
  getCurrentUser(): Promise<User>;
}

export class ApiUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User> {
    const authState = useAuthStore.getState();
    if (authState.isAuthenticated && authState.user) {
      return authState.user;
    }
    throw new Error("No authenticated user session active.");
  }
}

export const userRepository: UserRepository = new ApiUserRepository();
