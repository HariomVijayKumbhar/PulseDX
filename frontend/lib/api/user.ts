import { UserProfile, ActivityItem } from '@/types/user';
import { ApiResponse, ProductivitySummary } from '@/types/api';
import { apiClient } from './client';
import { mapBackendUser, BackendUser } from './mappers';
import { MOCK_USER, MOCK_ACTIVITIES, MOCK_PRODUCTIVITY_SUMMARY } from '../mock-data';

let userStore: UserProfile = { ...MOCK_USER };

/**
 * Fetch current user profile.
 * Live backend has no /users/me yet — falls back to first backend user, then to mock.
 */
export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  const res = await apiClient<UserProfile>('/users/me', { method: 'GET' }, () => userStore);

  if (res.success && res.data && (res.data as any).id && (res.data as any).name && !('stats' in (res.data as any))) {
    return res; // already frontend-shaped
  }

  // /users/me doesn't exist — try fetching the first backend user and map it
  try {
    const usersRes = await apiClient<BackendUser[]>('/users?limit=1', { method: 'GET' });
    const first = Array.isArray(usersRes.data) ? usersRes.data[0] : undefined;
    if (usersRes.success && first && 'name' in first && !('stats' in first)) {
      return {
        data: mapBackendUser(first),
        success: true,
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // ignore — keep mock fallback
  }
  return res;
}

/**
 * Fetch user activity log — backend has no activities endpoint; mock for now
 */
export async function getUserActivities(): Promise<ApiResponse<ActivityItem[]>> {
  return apiClient<ActivityItem[]>(
    '/users/me/activities',
    { method: 'GET' },
    () => MOCK_ACTIVITIES
  );
}

/**
 * Fetch developer productivity metrics — backend has no analytics endpoint; mock for now
 */
export async function getProductivitySummary(): Promise<ApiResponse<ProductivitySummary>> {
  return apiClient<ProductivitySummary>(
    '/analytics/productivity-summary',
    { method: 'GET' },
    () => MOCK_PRODUCTIVITY_SUMMARY
  );
}
