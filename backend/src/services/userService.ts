import { supabase } from '../lib/supabaseClient';
import { User, CreateUserInput, UpdateUserInput } from '../models/user.model';
import { NotFoundError } from '../middleware/errorHandler';
import { handleSupabaseError } from '../utils/dbError';
import { PaginationQuery, PaginatedResult } from '../models/query.model';

const ALLOWED_SORT_COLUMNS = ['created_at', 'name', 'email', 'role'];

export class UserService {
  private toModel(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatarUrl: row.avatar_url || undefined,
      role: row.role || undefined,
      createdAt: row.created_at,
    };
  }

  /**
   * Create a new user in Supabase
   */
  public async createUser(input: CreateUserInput): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: input.name,
        email: input.email,
        avatar_url: input.avatarUrl || null,
        role: input.role || 'fullstack_engineer',
      })
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'User');
    }

    return this.toModel(data);
  }

  /**
   * List users with optional pagination, search, and sorting
   */
  public async getUsers(query?: PaginationQuery): Promise<PaginatedResult<User>> {
    let queryBuilder = supabase.from('users').select('*', { count: 'exact' });

    // Search by name or email
    if (query?.search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
    }

    // Sorting with allow-list check
    const sortBy = query?.sortBy && ALLOWED_SORT_COLUMNS.includes(query.sortBy) ? query.sortBy : 'created_at';
    const ascending = query?.order === 'asc';
    queryBuilder = queryBuilder.order(sortBy, { ascending });

    // Pagination
    if (query?.page || query?.limit) {
      const page = Math.max(1, query?.page || 1);
      const limit = Math.max(1, Math.min(100, query?.limit || 20));
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;
      if (error) {
        handleSupabaseError(error, 'User');
      }

      return {
        data: (data || []).map((row) => this.toModel(row)),
        total: count || 0,
        page,
        limit,
      };
    }

    const { data, error, count } = await queryBuilder;
    if (error) {
      handleSupabaseError(error, 'User');
    }

    const userList = (data || []).map((row) => this.toModel(row));
    return {
      data: userList,
      total: count !== null && count !== undefined ? count : userList.length,
    };
  }

  /**
   * Get single user by ID
   */
  public async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      handleSupabaseError(error, 'User');
    }

    if (!data) {
      throw new NotFoundError('User', id);
    }

    return this.toModel(data);
  }

  /**
   * Update an existing user
   */
  public async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    // First ensure user exists
    await this.getUserById(id);

    const updatePayload: Record<string, any> = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.email !== undefined) updatePayload.email = input.email;
    if (input.avatarUrl !== undefined) updatePayload.avatar_url = input.avatarUrl || null;
    if (input.role !== undefined) updatePayload.role = input.role || null;

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, 'User');
    }

    return this.toModel(data);
  }

  /**
   * Delete a user by ID
   */
  public async deleteUser(id: string): Promise<void> {
    // Check user exists
    await this.getUserById(id);

    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'User');
    }
  }
}

export const userService = new UserService();
