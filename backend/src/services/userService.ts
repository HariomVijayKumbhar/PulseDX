import { db } from '../data/store';
import { User, CreateUserInput } from '../models/user.model';
import { NotFoundError, ConflictError } from '../middleware/errorHandler';

export class UserService {
  /**
   * Create a new user
   */
  public async createUser(input: CreateUserInput): Promise<User> {
    // Check if user with same email already exists
    const existing = db.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      throw new ConflictError(`User with email '${input.email}' already exists`);
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: input.name,
      email: input.email,
      avatarUrl: input.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      role: input.role || 'fullstack_engineer',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    return newUser;
  }

  /**
   * List all users
   */
  public async getUsers(): Promise<User[]> {
    return [...db.users];
  }

  /**
   * Get single user by ID
   */
  public async getUserById(id: string): Promise<User> {
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }
}

export const userService = new UserService();
