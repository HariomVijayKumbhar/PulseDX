import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, fullName?: string, avatarUrl?: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

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

    const json = await res.json();

    if (!res.ok) {
      const errMsg = json?.error?.message || 'Registration failed';
      return { data: null, error: new Error(errMsg) };
    }

    // 2. Automatically sign in with credentials now that email is confirmed
    const loginRes = await signIn(email, password);
    return loginRes;
  } catch (backendErr) {
    // Fallback directly to Supabase client if backend endpoint is unavailable
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
