/**
 * One-off migration: creates the `teams` table in Supabase Postgres
 * so the Teams feature no longer depends on MongoDB.
 *
 * Usage:  npm run db:teams   (from /backend)
 */
import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing from backend/.env');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      owner_id UUID NOT NULL,
      project_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      members JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('✅ teams table ready in Supabase');
  await client.end();
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
