import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult } from './types';
import { emailAdapter } from './email';
import { whatsappAdapter } from './whatsapp';
import { sendSms, smsConfigured } from './sms';
import { ownerSms } from './messages';
import { getSetting } from '@/lib/settings/store';
import { notifyClient } from './notifyClient';

/**
 * Fan a new booking out to every enabled channel.
 *
 * Recipients come from studio settings rather than environment variables, so
 * a change of phone or a second manager is a field in the dashboard, not a
 * redeploy. Deliveries run in parallel and never throw: a booking must still
 * be recorded and acknowledged even if a provider is down.
 */
export async function notifyAll(booking: BookingRecord): Promise<DeliveryResult[]> {
  const prefs = await getSetting('notifications');

  const jobs: Array<Promise<DeliveryResult>> = [];

  // --- The studio ---
  if (prefs.emailEnabled) {
    for (const address of prefs.ownerEmails.filter(Boolean)) {
      jobs.push(emailAdapter.notifyOwner(booking, address));
    }
  }

  if (prefs.smsEnabled && smsConfigured()) {
    for (const phone of prefs.ownerPhones.filter(Boolean)) {
      jobs.push(
        sendSms(phone, ownerSms(booking)).then(
          (r): DeliveryResult => ({
            channel: 'sms',
            target: 'owner',
            delivered: r.ok,
            detail: r.detail,
          }),
        ),
      );
    }
  }

  if (prefs.whatsappEnabled && whatsappAdapter.isConfigured()) {
    jobs.push(whatsappAdapter.notifyOwner(booking));
  }

  const [ownerResults, clientResults] = await Promise.all([
    Promise.allSettled(jobs),
    // The client's acknowledgement goes through the same path as every other
    // lifecycle message, so a studio-authored template applies here too.
    notifyClient('received', booking).catch((): DeliveryResult[] => []),
  ]);

  const owner = ownerResults.map((r): DeliveryResult =>
    r.status === 'fulfilled'
      ? r.value
      : { channel: 'email', target: 'owner', delivered: false, detail: String(r.reason) },
  );

  return [...owner, ...clientResults];
}
