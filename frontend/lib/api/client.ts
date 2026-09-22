import { supabase } from '../supabase';
import { ApiResponse } from '@/types/api';

const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api').replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

/** Abort requests that hang (backend down, network stall) instead of waiting minutes */
const REQUEST_TIMEOUT_MS = 2_500;
/** Short TTL cache for GET responses so repeated mounts don't refetch the same data */
const GET_CACHE_TTL_MS = 30_000;

type CacheEntry = { data: unknown; expiresAt: number };
const getCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<ApiResponse<unknown>>>();

let cachedToken: { token?: string; expiresAt: number } | null = null;
async function getAuthToken(): Promise<string | undefined> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    cachedToken = { token, expiresAt: now + 30_000 };
    return token;
  } catch {
    return undefined;
  }
}

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
  const method = (options?.method || 'GET').toUpperCase();
  const cacheKey = `${method} ${endpoint}`;

  // Serve repeated GETs from cache to keep the UI snappy
  if (method === 'GET' && typeof options?.body === 'undefined') {
    const hit = getCache.get(cacheKey);
    if (hit && hit.expiresAt > Date.now()) {
      return hit.data as ApiResponse<T>;
    }
    // Deduplicate concurrent identical GETs (e.g. two components mounting at once)
    const pending = inFlight.get(cacheKey);
    if (pending) {
      return pending as Promise<ApiResponse<T>>;
    }
  }

  const doRequest = async (): Promise<ApiResponse<T>> => {
  try {
    // 1. Fetch access token if user is authenticated (with in-memory cache)
    const token = await getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const result: ApiResponse<T> = {
      data: json.data,
      success: true,
      timestamp: json.meta?.timestamp || new Date().toISOString(),
    };
    if (method === 'GET') {
      getCache.set(cacheKey, { data: result, expiresAt: Date.now() + GET_CACHE_TTL_MS });
    }
    return result;
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
  };

  if (method !== 'GET') {
    // Mutations: never cached, and bust the GET cache so the next read is fresh
    getCache.clear();
    return doRequest();
  }

  const promise = doRequest().finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, promise as Promise<ApiResponse<unknown>>);
  return promise;
}
