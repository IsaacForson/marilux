import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult } from './types';
import { emailAdapter } from './email';
import { whatsappAdapter } from './whatsapp';
import { sendSms, smsConfigured } from './sms';
import { clientSms, ownerSms } from './messages';
import { SITE } from '@/lib/data/site';

/**
 * Fan a new booking out to every configured channel.
 *
 * Deliveries run in parallel and never throw: a booking must still be recorded
 * and acknowledged even if a provider is down. The results tell the studio
 * precisely which channel needs a manual follow-up.
 *
 * Both parties get both an email and an SMS deliberately — if one is missed or
 * filtered, the other still lands.
 */
export async function notifyAll(booking: BookingRecord): Promise<DeliveryResult[]> {
  const jobs: Array<Promise<DeliveryResult>> = [
    emailAdapter.notifyOwner(booking),
    emailAdapter.notifyCustomer(booking),
  ];

  if (smsConfigured()) {
    const ownerNumber = process.env.OWNER_SMS || process.env.OWNER_WHATSAPP || SITE.contact.phone;
    jobs.push(
      sendSms(ownerNumber, ownerSms(booking)).then((r) => ({
        channel: 'sms' as const,
        target: 'owner' as const,
        delivered: r.ok,
        detail: r.detail,
      })),
      sendSms(booking.phone, clientSms('received', booking)).then((r) => ({
        channel: 'sms' as const,
        target: 'customer' as const,
        delivered: r.ok,
        detail: r.detail,
      })),
    );
  }

  // Only attempted when credentials exist, so a paused WhatsApp does not fill
  // the studio's log with the same "not configured" line on every booking.
  if (whatsappAdapter.isConfigured()) {
    jobs.push(whatsappAdapter.notifyOwner(booking), whatsappAdapter.notifyCustomer(booking));
  }

  const settled = await Promise.allSettled(jobs);
  return settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : {
          channel: 'email',
          target: i % 2 === 0 ? 'owner' : 'customer',
          delivered: false,
          detail: String(r.reason),
        },
  );
}
