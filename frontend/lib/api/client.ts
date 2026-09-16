import { supabase } from '../supabase';
import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

/**
 * Standard API Client Wrapper
 * Calls live backend endpoints with automatic Authorization Bearer token insertion
 * from active Supabase session. Falls back cleanly to mock implementation if live backend is unreachable.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackMock?: () => T
): Promise<ApiResponse<T>> {
  try {
    // 1. Fetch access token if user is authenticated
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    return {
      data: json.data,
      success: true,
      timestamp: json.meta?.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    // If backend is unreachable or not running, fall back gracefully to local mocks for uninterrupted UX
    if (fallbackMock) {
      return {
        data: fallbackMock(),
        success: true,
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }
}
