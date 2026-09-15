import { SITE } from '@/lib/data/site';

export type Slot = { minutes: number; available: boolean };

/**
 * Availability for a given day.
 *
 * This is a deterministic stand-in so the flow is fully usable before a
 * calendar backend exists: the same date and specialist always yield the same
 * grid, which keeps the UI stable across re-renders and reloads. Replace the
 * body with a fetch to the studio calendar (Google Calendar, Fresha, or an
 * internal table) — the signature is what the UI depends on.
 */
export function getAvailability(
  isoDate: string,
  durationMinutes: number,
  specialistSlug = 'any',
): Slot[] {
  const date = parseISODate(isoDate);
  if (!date) return [];

  const hours = SITE.openingHours[date.getDay()];
  if (!hours) return [];

  const open = hours.open * 60;
  const close = hours.close * 60;
  const step = 30;
  // Treatments must finish before closing, so the last start is pulled back.
  const lastStart = close - Math.min(durationMinutes, close - open);

  const slots: Slot[] = [];
  for (let m = open; m <= lastStart; m += step) {
    slots.push({ minutes: m, available: isOpen(isoDate, specialistSlug, m) });
  }
  return slots;
}

/** Same-day bookings close two hours ahead so the studio can prepare. */
export function isSelectableDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const maxAhead = new Date(today);
  maxAhead.setDate(maxAhead.getDate() + 89);
  return d >= today && d <= maxAhead;
}

export function isPastSlot(isoDate: string, minutes: number) {
  const now = new Date();
  const date = parseISODate(isoDate);
  if (!date) return true;
  if (date.toDateString() !== now.toDateString()) return false;
  return minutes < now.getHours() * 60 + now.getMinutes() + 120;
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Stable hash so the same inputs always produce the same answer. */
function isOpen(isoDate: string, specialist: string, minutes: number) {
  if (isPastSlot(isoDate, minutes)) return false;
  const key = isoDate + specialist + minutes;
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Roughly two thirds of the day is bookable — busy, but not discouraging.
  return (h >>> 0) % 100 > 32;
}
