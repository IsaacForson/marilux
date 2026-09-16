import type { BookingRecord } from '@/lib/booking/types';

/**
 * The seam between the app and wherever bookings live.
 *
 * Two implementations ship: Supabase Postgres (used whenever DATABASE_URL is
 * set) and a JSON file (the local fallback). Anything else — Turso, MySQL, an
 * existing salon system — only has to satisfy this interface.
 */
export type BookingRepository = {
  all(): Promise<BookingRecord[]>;
  find(reference: string): Promise<BookingRecord | undefined>;
  create(record: BookingRecord): Promise<BookingRecord>;
  update(
    reference: string,
    patch: Partial<BookingRecord>,
  ): Promise<BookingRecord | undefined>;
  /** Bookings that would collide with a proposed slot. */
  activeOn(isoDate: string): Promise<BookingRecord[]>;
};
