export type UserRole =
  | 'lead_developer'
  | 'senior_engineer'
  | 'fullstack_engineer'
  | 'frontend_specialist'
  | 'devops_engineer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: UserRole | string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}
