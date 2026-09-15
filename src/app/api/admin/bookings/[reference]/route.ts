import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { bookings } from '@/lib/store/bookings';
import { notifyClient } from '@/lib/integrations/notifyClient';
import type { MessageKind } from '@/lib/integrations/messages';
import type { BookingRecord, BookingStatus, DepositStatus } from '@/lib/booking/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'declined', 'completed', 'cancelled', 'no-show'])
    .optional(),
  depositStatus: z
    .enum(['pending', 'paid', 'awaiting-link', 'refunded', 'failed'])
    .optional(),
  staffNote: z.string().max(1000).optional(),
  /** Send the matching client email/WhatsApp as part of this change. */
  notify: z.boolean().optional(),
});

/** Status changes that have a client-facing message attached. */
const MESSAGE_FOR: Partial<Record<BookingStatus, MessageKind>> = {
  confirmed: 'confirmed',
  declined: 'declined',
  cancelled: 'cancelled',
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const { reference } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid change.' }, { status: 422 });
  }

  const existing = await bookings.find(reference);
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
  }

  const patch: Partial<BookingRecord> = {};
  if (parsed.data.status) patch.status = parsed.data.status;
  if (parsed.data.depositStatus) {
    patch.depositStatus = parsed.data.depositStatus as DepositStatus;
  }
  if (parsed.data.staffNote !== undefined) patch.staffNote = parsed.data.staffNote;

  const updated = await bookings.update(reference, patch);
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
  }

  // Notify only when the studio asked, and only for status changes the client
  // should hear about.
  let delivery: Awaited<ReturnType<typeof notifyClient>> = [];
  const kind = parsed.data.status ? MESSAGE_FOR[parsed.data.status] : undefined;

  if (parsed.data.notify && kind) {
    delivery = await notifyClient(kind, updated);
    if (delivery.some((d) => d.channel === 'email' && d.delivered)) {
      await bookings.update(reference, { confirmationSentAt: new Date().toISOString() });
    }
  }

  return NextResponse.json({
    ok: true,
    booking: await bookings.find(reference),
    delivery: delivery.map(({ channel, delivered, detail }) => ({
      channel,
      delivered,
      detail: delivered ? undefined : detail,
    })),
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const { reference } = await params;
  const booking = await bookings.find(reference);
  if (!booking) {
    return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, booking });
}
