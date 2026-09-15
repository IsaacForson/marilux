import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult } from './types';
import { emailAdapter } from './email';
import { whatsappAdapter } from './whatsapp';

/**
 * Fan out a booking to every configured channel.
 *
 * Deliveries run in parallel and never throw: a booking must still be recorded
 * and acknowledged to the guest even if Gmail or WhatsApp is briefly down. The
 * results tell the studio exactly which channel needs a manual follow-up.
 */
export async function notifyAll(booking: BookingRecord): Promise<DeliveryResult[]> {
  const results = await Promise.allSettled([
    emailAdapter.notifyOwner(booking),
    emailAdapter.notifyCustomer(booking),
    whatsappAdapter.notifyOwner(booking),
    whatsappAdapter.notifyCustomer(booking),
  ]);

  return results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          channel: i < 2 ? ('email' as const) : ('whatsapp' as const),
          target: i % 2 === 0 ? ('owner' as const) : ('customer' as const),
          delivered: false,
          detail: String(r.reason),
        },
  );
}
