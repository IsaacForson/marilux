/**
 * Moves bookings from the local JSON store into Postgres.
 *
 * Idempotent: an existing reference is skipped, never overwritten, so this can
 * be run repeatedly while switching a live studio over.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const file = path.join(process.cwd(), '.data', 'bookings.json');
let records = [];
try {
  records = JSON.parse(await readFile(file, 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('No .data/bookings.json — nothing to import.');
    process.exit(0);
  }
  throw error;
}

const sql = postgres(url, { ssl: 'require', max: 1, prepare: false, connect_timeout: 20 });
let imported = 0;
let skipped = 0;

try {
  for (const r of records) {
    const [existing] = await sql`
      select 1 from public.bookings where reference = ${r.reference}`;
    if (existing) {
      skipped += 1;
      continue;
    }

    await sql`
      insert into public.bookings (
        reference, name, email, phone, whatsapp,
        category_slug, category_name, service_slug, service_name,
        specialist_slug, specialist_name, duration_minutes,
        booking_date, booking_time, price, deposit, deposit_status,
        status, notes, staff_note, policies_accepted,
        confirmation_sent_at, reminder_sent_at, created_at, updated_at
      ) values (
        ${r.reference}, ${r.name}, ${r.email}, ${r.phone}, ${r.whatsapp},
        ${r.categorySlug}, ${r.categoryName}, ${r.serviceSlug}, ${r.serviceName},
        ${r.specialistSlug}, ${r.specialistName}, ${r.duration},
        ${r.date}::date, ${r.time},
        ${r.price}, ${r.deposit}, ${r.depositStatus ?? 'pending'},
        ${r.status ?? 'pending'}, ${r.notes ?? null}, ${r.staffNote ?? null},
        ${r.policiesAccepted ?? true},
        ${r.confirmationSentAt ?? null}, ${r.reminderSentAt ?? null},
        ${r.createdAt}, ${r.updatedAt ?? r.createdAt}
      )`;
    imported += 1;
  }

  const [{ count }] = await sql`select count(*)::int as count from public.bookings`;
  console.log(
    'imported ' + imported + ', skipped ' + skipped + ' (already present). Total in database: ' + count,
  );
} catch (error) {
  console.error('Import failed:', error.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
