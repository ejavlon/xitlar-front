import { User } from "../types/user";
import { mockUser } from "../mock/users";

export interface UserRepository {
  getCurrentUser(): Promise<User>;
}

export class MockUserRepository implements UserRepository {
  async getCurrentUser(): Promise<User> {
    return mockUser;
  }
}

export const userRepository: UserRepository = new MockUserRepository();
