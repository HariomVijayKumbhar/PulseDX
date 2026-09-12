export type UserRole =
  | 'lead_developer'
  | 'senior_engineer'
  | 'fullstack_engineer'
  | 'frontend_specialist'
  | 'devops_engineer';

export type UserStatus = 'active' | 'in_flow' | 'in_meeting' | 'offline';

export interface UserStats {
  tasksCompleted: number;
  openPRs: number;
  streakDays: number;
  focusHoursWeekly: number;
  codeReviewsGiven: number;
  velocityScore: number;
  completionRate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  roleDisplay: string;
  avatarUrl: string;
  team: string;
  department: string;
  status: UserStatus;
  bio: string;
  joinedAt: string;
  stats: UserStats;
}

export type ActivityType =
  | 'commit'
  | 'pull_request'
  | 'review'
  | 'task_completed'
  | 'deployment'
  | 'milestone';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  repoName: string;
  branch?: string;
  url?: string;
  author: {
    name: string;
    avatarUrl: string;
  };
}
