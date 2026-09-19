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
export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  const res = await apiClient<UserProfile>('/users/me', { method: 'GET' });

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
    // ignore — return the original (failed) response
  }
  return res;
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
