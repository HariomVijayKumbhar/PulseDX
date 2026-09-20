import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, fullName?: string, avatarUrl?: string) {
  const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api').replace(/\/+$/, '');
  const apiUrl = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

  try {
    // 1. Call backend registration endpoint to create auto-confirmed user
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name: fullName,
        avatarUrl,
      }),
    });

    if (res.ok) {
      // Automatically sign in with credentials now that email is confirmed
      const loginRes = await signIn(email, password);
      return loginRes;
    }

    // If 404 or backend unavailable, fall through to direct Supabase sign up
    const json = await res.json().catch(() => null);
    if (res.status !== 404 && json?.error?.message) {
      return { data: null, error: new Error(json.error.message) };
    }
  } catch {
    // Fallback directly to Supabase client if backend is unreachable or throws
  }

  // Direct Supabase fallback
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...(fullName ? { full_name: fullName, name: fullName } : {}),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
