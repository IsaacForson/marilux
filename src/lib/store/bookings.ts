import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { BookingRecord, BookingStatus } from '@/lib/booking/types';
import type { BookingRepository } from './types';
import { db, dbConfigured, queryOrNull } from './db';
import { postgresRepository } from './postgresRepository';

export type { BookingRepository } from './types';

/* ------------------------------------------------------------------ */
/* JSON file store — the fallback when no database is configured       */
/* ------------------------------------------------------------------ */

const DATA_DIR = process.env.BOOKINGS_DIR || path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'bookings.json');

/**
 * Writes are serialised through this promise chain.
 *
 * Two concurrent bookings landing in the same tick would otherwise both read
 * the file, both append, and the second write would erase the first.
 */
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<BookingRecord[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRecord[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    console.error('[store] could not read bookings:', error);
    return [];
  }
}

async function writeAll(records: BookingRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file and rename: a crash mid-write cannot corrupt the store.
  const tmp = FILE + '.' + process.pid + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(records, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
}

const fileRepository: BookingRepository = {
  async all() {
    const records = await readAll();
    return records.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },

  async find(reference) {
    const records = await readAll();
    return records.find((r) => r.reference === reference);
  },

  async create(record) {
    return enqueue(async () => {
      const records = await readAll();
      records.push(record);
      await writeAll(records);
      return record;
    });
  },

  async update(reference, patch) {
    return enqueue(async () => {
      const records = await readAll();
      const index = records.findIndex((r) => r.reference === reference);
      if (index === -1) return undefined;
      const next: BookingRecord = {
        ...records[index],
        ...patch,
        // The caller must never be able to rewrite identity or the clock.
        reference: records[index].reference,
        createdAt: records[index].createdAt,
        updatedAt: new Date().toISOString(),
      };
      records[index] = next;
      await writeAll(records);
      return next;
    });
  },

  async activeOn(isoDate) {
    const records = await readAll();
    return records.filter(
      (r) => r.date === isoDate && (r.status === 'pending' || r.status === 'confirmed'),
    );
  },
};

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

/**
 * Supabase whenever DATABASE_URL is present; otherwise the JSON file, so the
 * project still runs with no database at all.
 *
 * The file store is not suitable for serverless hosts — their filesystems are
 * ephemeral — which is why the dashboard reports which store is live.
 */
export const usingDatabase = dbConfigured();

export const bookings: BookingRepository = usingDatabase
  ? postgresRepository
  : fileRepository;

/** Exported so the import script can read the old store explicitly. */
export const fileBookings = fileRepository;

/* ------------------------------------------------------------------ */
/* Reporting                                                           */
/* ------------------------------------------------------------------ */

export type Earnings = {
  /** Deposits actually received. Money in the bank. */
  depositsCollected: number;
  /** Balance still to be paid in studio on confirmed, upcoming appointments. */
  balanceOutstanding: number;
  /** Total value of appointments that have been delivered. */
  revenueCompleted: number;
  /** Total value of everything confirmed but not yet delivered. */
  revenueBooked: number;
  /** Deposits forfeited through no-shows. */
  forfeited: number;
  appointments: number;
  averageValue: number;
};

export function summarise(records: BookingRecord[]): Earnings {
  let depositsCollected = 0;
  let balanceOutstanding = 0;
  let revenueCompleted = 0;
  let revenueBooked = 0;
  let forfeited = 0;
  let counted = 0;

  for (const r of records) {
    if (r.depositStatus === 'paid') depositsCollected += r.deposit;

    if (r.status === 'completed') {
      revenueCompleted += r.price;
      counted += 1;
    } else if (r.status === 'confirmed') {
      revenueBooked += r.price;
      if (r.depositStatus === 'paid') balanceOutstanding += r.price - r.deposit;
    } else if (r.status === 'no-show' && r.depositStatus === 'paid') {
      forfeited += r.deposit;
    }
  }

  return {
    depositsCollected,
    balanceOutstanding,
    revenueCompleted,
    revenueBooked,
    forfeited,
    appointments: counted,
    averageValue: counted ? Math.round(revenueCompleted / counted) : 0,
  };
}

export const byStatus = (records: BookingRecord[]) =>
  records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

export function statusCount(records: BookingRecord[], status: BookingStatus) {
  return records.filter((r) => r.status === status).length;
}

/** Badge count for the admin nav — one COUNT, not the whole bookings table. */
export async function pendingCount(): Promise<number> {
  if (!usingDatabase) return statusCount(await bookings.all(), 'pending');
  const sql = db();
  const rows = await queryOrNull(
    'pending-count',
    () =>
      sql<Array<{ n: number }>>`
        select count(*)::int as n from public.bookings where status = 'pending'`,
  );
  return rows?.[0]?.n ?? 0;
}
