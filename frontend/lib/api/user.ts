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
 * Fetch user activity log.
 * NOTE: backend has no /users/me/activities endpoint yet — serve mock data directly
 * to avoid 404 console noise. Swap to apiClient when the endpoint exists.
 */
export async function getUserActivities(): Promise<ApiResponse<ActivityItem[]>> {
  return {
    data: MOCK_ACTIVITIES,
    success: true,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch developer productivity metrics.
 * NOTE: backend has no /analytics/productivity-summary endpoint yet — serve mock data
 * directly to avoid 404 console noise. Swap to apiClient when the endpoint exists.
 */
export async function getProductivitySummary(): Promise<ApiResponse<ProductivitySummary>> {
  return {
    data: MOCK_PRODUCTIVITY_SUMMARY,
    success: true,
    timestamp: new Date().toISOString(),
  };
}
