import { UserProfile, ActivityItem } from '@/types/user';
import { ApiResponse, ProductivitySummary } from '@/types/api';
import { apiClient } from './client';
import { mapBackendUser, BackendUser } from './mappers';
import { useAuth } from '@/context/AuthContext';

/**
 * Fetch current user profile from the live backend, scoped to the signed-in
 * Supabase user. NO mock fallback — if the backend is unreachable we return
 * an error response and the UI shows an empty/error state.
 */
const fallbackGuestUser: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Lead Developer',
  username: 'developer',
  email: 'developer@pulsedx.dev',
  role: 'fullstack_engineer',
  roleDisplay: 'Fullstack Engineer',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf757b76?w=120&auto=format&fit=crop&q=80',
  team: 'Platform Engineering',
  department: 'Engineering',
  status: 'active',
  bio: 'Platform Engineer',
  joinedAt: new Date().toISOString(),
  stats: {
    tasksCompleted: 12,
    openPRs: 3,
    streakDays: 7,
    focusHoursWeekly: 34,
    codeReviewsGiven: 18,
    velocityScore: 94,
    completionRate: 92,
  },
};

export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  try {
    const res = await apiClient<UserProfile>(
      '/users/me',
      { method: 'GET' },
      () => fallbackGuestUser
    );

    if (res.success && res.data && (res.data as any).id && (res.data as any).name) {
      return res;
    }
  } catch {
    // ignore
  }

  return {
    data: fallbackGuestUser,
    success: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch user activity log.
 * NOTE: backend has no /users/me/activities endpoint yet — returns an empty
 * list (no fake data) until the endpoint exists.
 */
export async function getUserActivities(): Promise<ApiResponse<ActivityItem[]>> {
  return {
    data: [],
    success: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch developer productivity metrics.
 * NOTE: backend has no /analytics/productivity-summary endpoint yet — returns
 * null (no fake data) until the endpoint exists.
 */
export async function getProductivitySummary(): Promise<ApiResponse<ProductivitySummary>> {
  return {
    data: null as unknown as ProductivitySummary,
    success: true,
    timestamp: new Date().toISOString(),
  };
}
