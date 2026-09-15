import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import { emailAdapter } from './email';
import { whatsappAdapter } from './whatsapp';
import {
  clientMessageHtml,
  clientMessageSubject,
  clientMessageText,
  type MessageKind,
} from './messages';
import { sendMail, smtpConfigured } from './smtp';
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

  const whatsapp = whatsappAdapter
    .notifyCustomer({ ...booking, notes: text })
    .catch((error): DeliveryResult => ({
      channel: 'whatsapp',
      target: 'customer',
      delivered: false,
      detail: error instanceof Error ? error.message : 'WhatsApp send failed',
    }));

  return Promise.all([email, whatsapp]);
}
