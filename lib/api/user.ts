import { UserProfile, ActivityItem } from '@/types/user';
import { ApiResponse, ProductivitySummary } from '@/types/api';
import { apiClient } from './client';
import { MOCK_USER, MOCK_ACTIVITIES, MOCK_PRODUCTIVITY_SUMMARY } from '../mock-data';

let userStore: UserProfile = { ...MOCK_USER };

/**
 * Fetch current user profile with velocity and stats
 */
export async function getCurrentUser(): Promise<ApiResponse<UserProfile>> {
  return apiClient<UserProfile>(
    '/users/me',
    { method: 'GET' },
    () => userStore
  );
}

/**
 * Fetch user activity log (commits, PRs, reviews)
 */
export async function getUserActivities(): Promise<ApiResponse<ActivityItem[]>> {
  return apiClient<ActivityItem[]>(
    '/users/me/activities',
    { method: 'GET' },
    () => MOCK_ACTIVITIES
  );
}

/**
 * Fetch developer productivity metrics (weekly focus, completion rates)
 */
export async function getProductivitySummary(): Promise<ApiResponse<ProductivitySummary>> {
  return apiClient<ProductivitySummary>(
    '/analytics/productivity-summary',
    { method: 'GET' },
    () => MOCK_PRODUCTIVITY_SUMMARY
  );
}
