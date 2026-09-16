import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import { emailAdapter } from './email';
import { deliverToClient, whatsappConfigured } from './whatsapp';
import { sendSms, smsConfigured } from './sms';
import {
  clientMessageHtml,
  clientMessageSubject,
  clientMessageText,
  clientSms,
  clientStatusLine,
  type MessageKind,
} from './messages';
import { sendMail, smtpConfigured } from './smtp';
import { brevoConfigured, sendViaBrevo } from './brevo';
import type { DeliveryResult } from './types';

/**
 * Send a lifecycle message to the client (confirmation, decline, reminder).
 *
 * Kept separate from the booking-received fan-out because these are triggered
 * by the studio from the admin dashboard, and the studio needs to know
 * precisely whether each channel succeeded.
 */
export async function notifyClient(
  kind: MessageKind,
  booking: BookingRecord,
): Promise<DeliveryResult[]> {
  const subject = clientMessageSubject(kind, booking);
  const text = clientMessageText(kind, booking);
  const html = clientMessageHtml(kind, booking);

  const email: Promise<DeliveryResult> = (async () => {
    if (!emailAdapter.isConfigured()) {
      return {
        channel: 'email' as const,
        target: 'customer' as const,
        delivered: false,
        detail: 'No email transport configured.',
      };
    }
    if (brevoConfigured()) {
      try {
        await sendViaBrevo({ to: booking.email, subject, text, html });
        return { channel: 'email' as const, target: 'customer' as const, delivered: true };
      } catch (error) {
        const detail = error instanceof Error ? error.message : 'Brevo send failed';
        if (!smtpConfigured()) {
          return { channel: 'email' as const, target: 'customer' as const, delivered: false, detail };
        }
        console.warn('[email] Brevo API failed, falling back to SMTP: ' + detail);
      }
    }

    if (smtpConfigured()) {
      try {
        await sendMail({ to: booking.email, subject, text, html });
        return { channel: 'email' as const, target: 'customer' as const, delivered: true };
      } catch (error) {
        return {
          channel: 'email' as const,
          target: 'customer' as const,
          delivered: false,
          detail: error instanceof Error ? error.message : 'SMTP send failed',
        };
      }
    }
    // Gmail API path reuses the adapter, which formats its own booking mail;
    // for lifecycle messages we send through the same transport with our copy.
    return emailAdapter.notifyCustomer({ ...booking });
  })();

  const jobs: Array<Promise<DeliveryResult>> = [email];

  if (smsConfigured()) {
    jobs.push(
      sendSms(booking.phone, clientSms(kind, booking)).then(
        (r): DeliveryResult => ({
          channel: 'sms',
          target: 'customer',
          delivered: r.ok,
          detail: r.detail,
        }),
      ),
    );
  }

  // The WhatsApp message carries this kind's own copy — reusing the
  // booking-received body here would tell a reminder recipient that their
  // appointment had just been reserved.
  if (whatsappConfigured()) {
    jobs.push(
      deliverToClient(booking, text, clientStatusLine(kind)).catch(
        (error): DeliveryResult => ({
          channel: 'whatsapp',
          target: 'customer',
          delivered: false,
          detail: error instanceof Error ? error.message : 'WhatsApp send failed',
        }),
      ),
    );
  }

  return Promise.all(jobs);
}
