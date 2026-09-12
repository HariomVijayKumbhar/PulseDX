import { ApiResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Simulates network delay for realistic async loading states in frontend-only phase.
 * In Tasks 2-4, this will be replaced with real window.fetch() calls.
 */
export async function simulateNetworkDelay(ms: number = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Standard API Client Wrapper
 * Built to make swapping to live endpoints seamless by simply switching
 * the internal fetch implementation without touching any consuming UI components.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackMock?: () => T
): Promise<ApiResponse<T>> {
  // If a live backend exists and is enabled, execute real HTTP request
  const useRealBackend = process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true';

  if (useRealBackend) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }

      const json = await res.json();
      return json;
    } catch (error) {
      console.error(`[API Client Error] ${endpoint}:`, error);
      throw error;
    }
  }

  // Simulated latency for authentic UX testing (skeleton loaders, optimistic updates)
  await simulateNetworkDelay(300);

  if (fallbackMock) {
    return {
      data: fallbackMock(),
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  throw new Error(`Endpoint ${endpoint} not implemented in mock mode`);
}
