import 'server-only';
import type { BookingRecord } from '@/lib/booking/types';
import { emailAdapter } from './email';
import { deliverToClient, whatsappConfigured } from './whatsapp';
import { sendSms, smsConfigured } from './sms';
import { buildMessage, clientStatusLine, type MessageKind } from './messages';
import { sendMail, smtpConfigured } from './smtp';
import { brevoConfigured, sendViaBrevo } from './brevo';
import { getSetting } from '@/lib/settings/store';
import type { DeliveryResult } from './types';

/**
 * Send a lifecycle message to the client.
 *
 * Copy comes from the studio's own template when they have written one, and
 * from the shipped defaults otherwise. Each channel can be switched off in
 * settings without removing credentials.
 */
export async function notifyClient(
  kind: MessageKind,
  booking: BookingRecord,
): Promise<DeliveryResult[]> {
  const [prefs, templates] = await Promise.all([
    getSetting('notifications'),
    getSetting('templates'),
  ]);

  const template = kind in templates ? templates[kind as keyof typeof templates] : undefined;
  const message = buildMessage(kind, booking, template);

  if (!message.enabled) {
    return [
      {
        channel: 'email',
        target: 'customer',
        delivered: false,
        detail: 'This message is switched off in settings.',
      },
    ];
  }

  const jobs: Array<Promise<DeliveryResult>> = [];

  if (prefs.emailEnabled && prefs.notifyClientEmail) {
    jobs.push(sendClientEmail(booking, message));
  }

  if (prefs.smsEnabled && prefs.notifyClientSms && smsConfigured()) {
    jobs.push(
      sendSms(booking.phone, message.sms).then(
        (r): DeliveryResult => ({
          channel: 'sms',
          target: 'customer',
          delivered: r.ok,
          detail: r.detail,
        }),
      ),
    );
  }

  if (prefs.whatsappEnabled && whatsappConfigured()) {
    jobs.push(
      deliverToClient(booking, message.text, clientStatusLine(kind)).catch(
        (error): DeliveryResult => ({
          channel: 'whatsapp',
          target: 'customer',
          delivered: false,
          detail: error instanceof Error ? error.message : 'WhatsApp send failed',
        }),
      ),
    );
  }

  if (jobs.length === 0) {
    return [
      {
        channel: 'email',
        target: 'customer',
        delivered: false,
        detail: 'Every client channel is switched off in settings.',
      },
    ];
  }

  return Promise.all(jobs);
}

async function sendClientEmail(
  booking: BookingRecord,
  message: { subject: string; text: string; html: string },
): Promise<DeliveryResult> {
  const { subject, text, html } = message;

  if (!emailAdapter.isConfigured()) {
    return {
      channel: 'email',
      target: 'customer',
      delivered: false,
      detail: 'No email transport configured.',
    };
  }

  if (brevoConfigured()) {
    try {
      await sendViaBrevo({ to: booking.email, subject, text, html });
      return { channel: 'email', target: 'customer', delivered: true };
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Brevo send failed';
      if (!smtpConfigured()) {
        return { channel: 'email', target: 'customer', delivered: false, detail };
      }
      console.warn('[email] Brevo API failed, falling back to SMTP: ' + detail);
    }
  }

  try {
    await sendMail({ to: booking.email, subject, text, html });
    return { channel: 'email', target: 'customer', delivered: true };
  } catch (error) {
    return {
      channel: 'email',
      target: 'customer',
      delivered: false,
      detail: error instanceof Error ? error.message : 'SMTP send failed',
    };
  }
}
