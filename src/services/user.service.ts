import { userRepository, UserRepository } from "../repositories/user.repository";
import { User } from "../types/user";

export class UserService {
  private repository: UserRepository;

  constructor(repository: UserRepository = userRepository) {
    this.repository = repository;
  }

  async getCurrentUser(): Promise<User> {
    return this.repository.getCurrentUser();
  }
}

export const userService = new UserService();
