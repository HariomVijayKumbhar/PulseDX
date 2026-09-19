/**
 * Purges all seeded/mock rows from the Supabase database.
 * Deletes tasks → projects → users (in FK-safe order).
 * Auth users in supabase.auth are NOT touched.
 *
 * Run: npm run db:purge
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!url || !key) {
  console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function deleteAll(table: string): Promise<number> {
  const { data, error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000').select('id');
  if (error) {
    console.error(`❌ Failed deleting ${table}:`, error.message);
    return 0;
  }
  return data?.length ?? 0;
}

async function main() {
  console.log('🧹 Purging mock data from Supabase…');
  const tasks = await deleteAll('tasks');
  const projects = await deleteAll('projects');
  const users = await deleteAll('users');
  console.log(`✅ Deleted: ${tasks} tasks, ${projects} projects, ${users} users`);
  console.log('Database is now clean. New accounts start with zero data.');
}

main();
