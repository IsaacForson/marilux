import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { bookings } from '@/lib/store/bookings';
import { notifyClient } from '@/lib/integrations/notifyClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  kind: z.enum(['confirmed', 'declined', 'reminder', 'cancelled']),
});

/** Send a client message on demand — a reminder, or a re-send of a confirmation. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const { reference } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Unknown message type.' }, { status: 422 });
  }

  const booking = await bookings.find(reference);
  if (!booking) {
    return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
  }

  const delivery = await notifyClient(parsed.data.kind, booking);
  const stamp = new Date().toISOString();

  if (delivery.some((d) => d.delivered)) {
    await bookings.update(reference,
      parsed.data.kind === 'reminder' ? { reminderSentAt: stamp } : { confirmationSentAt: stamp },
    );
  }

  const failures = delivery.filter((d) => !d.delivered);
  return NextResponse.json({
    ok: delivery.some((d) => d.delivered),
    // The studio needs the real reason a channel failed, unlike public callers.
    delivery: delivery.map(({ channel, delivered, detail }) => ({ channel, delivered, detail })),
    error: failures.length === delivery.length ? 'No channel could deliver this message.' : undefined,
    booking: await bookings.find(reference),
  });
}
