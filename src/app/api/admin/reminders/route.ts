import { NextResponse } from 'next/server';
import { isSignedIn } from '@/lib/admin/auth';
import { bookings } from '@/lib/store/bookings';
import { notifyClient } from '@/lib/integrations/notifyClient';
import { toISODate } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Send tomorrow's reminders in one action.
 *
 * Only confirmed appointments, and only those that have not already had a
 * reminder — pressing the button twice must not message anyone twice.
 *
 * This is also the endpoint to point a daily cron at: authorise with the
 * `x-cron-key` header matching CRON_SECRET instead of an admin session.
 */
export async function POST(req: Request) {
  const cronKey = req.headers.get('x-cron-key');
  const viaCron = Boolean(
    process.env.CRON_SECRET && cronKey && cronKey === process.env.CRON_SECRET,
  );

  if (!viaCron && !(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = toISODate(tomorrow);

  const due = (await bookings.all()).filter(
    (b) => b.date === target && b.status === 'confirmed' && !b.reminderSentAt,
  );

  const results = [];
  for (const booking of due) {
    const delivery = await notifyClient('reminder', booking);
    const sent = delivery.some((d) => d.delivered);
    if (sent) {
      await bookings.update(booking.reference, { reminderSentAt: new Date().toISOString() });
    }
    results.push({ reference: booking.reference, name: booking.name, sent });
  }

  return NextResponse.json({
    ok: true,
    date: target,
    considered: due.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
}
