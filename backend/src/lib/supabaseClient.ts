import 'dotenv/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[SupabaseClient] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. Set them in backend/.env'
  );
}

/**
 * Public (anon) client — used ONLY for flows that must trigger Supabase's
 * built-in emails (e.g. signup confirmation). The service-role client above
 * bypasses email sending, so it cannot be used for registration.
 */
export const supabaseAnon: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
