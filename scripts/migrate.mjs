/**
 * Applies every SQL file in supabase/migrations, in filename order.
 *
 * Migrations are written to be idempotent, and each is recorded in
 * public._migrations so a re-run is a no-op rather than a risk.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Add it to .env.local (see .env.example).');
  process.exit(1);
}

// Migrations must run on a single session, so use the session pooler (5432)
// even when the app is pointed at the transaction pooler (6543).
const sessionUrl = url.replace(':6543/', ':5432/');
const sql = postgres(sessionUrl, { ssl: 'require', max: 1, connect_timeout: 20 });

try {
  await sql`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;

  const dir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const [done] = await sql`select 1 from public._migrations where name = ${file}`;
    if (done) {
      console.log('· ' + file + ' (already applied)');
      continue;
    }
    const body = await readFile(path.join(dir, file), 'utf8');
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into public._migrations (name) values (${file})`;
    });
    console.log('✓ ' + file);
  }

  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema = 'public' order by 1`;
  console.log('\npublic tables: ' + tables.map((t) => t.table_name).join(', '));
} catch (error) {
  console.error('\nMigration failed:', error.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
