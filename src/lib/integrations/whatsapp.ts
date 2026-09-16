import 'server-only';
import { SITE } from '@/lib/data/site';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult, NotificationAdapter } from './types';
import { whatsappOwnerMessage } from './format';

/**
 * WhatsApp Business Cloud API.
 *
 * Required:
 *   WHATSAPP_TOKEN            permanent system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  the sending number's ID
 *   OWNER_WHATSAPP            E.164 digits (defaults to the studio line)
 *
 * Meta's 24-hour rule: a business may only send free-form text to someone who
 * messaged it in the last 24 hours. Outside that window an approved template
 * is required. Set WHATSAPP_CUSTOMER_TEMPLATE to a template name and client
 * messages use it; without one we still send free-form, which succeeds inside
 * the window and returns a clear error outside it.
 *
 * See WHATSAPP-SETUP.md for the walkthrough and the exact template to submit.
 */

const API_VERSION = 'v21.0';

export type SendOutcome = {
  ok: boolean;
  /** Meta's own error text, surfaced verbatim so it is actually debuggable. */
  detail?: string;
  messageId?: string;
};

function configured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

async function post(payload: Record<string, unknown>): Promise<SendOutcome> {
  if (!configured()) {
    return { ok: false, detail: 'WhatsApp is not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).' };
  }

  try {
    const res = await fetch(
      'https://graph.facebook.com/' +
        API_VERSION +
        '/' +
        process.env.WHATSAPP_PHONE_NUMBER_ID +
        '/messages',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.WHATSAPP_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
        signal: AbortSignal.timeout(15_000),
      },
    );

    const json = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>;
      error?: { message?: string; code?: number; error_data?: { details?: string } };
    };

    if (!res.ok || json.error) {
      const e = json.error;
      const detail = e
        ? [e.message, e.error_data?.details, e.code ? '(code ' + e.code + ')' : '']
            .filter(Boolean)
            .join(' ')
        : 'WhatsApp API responded ' + res.status;
      return { ok: false, detail };
    }

    return { ok: true, messageId: json.messages?.[0]?.id };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}

/** Free-form text. Only delivers inside Meta's 24-hour service window. */
export function sendText(to: string, body: string) {
  return post({
    to: normaliseGhanaNumber(to),
    type: 'text',
    text: { preview_url: false, body },
  });
}

/** An approved template. Works at any time. */
export function sendTemplate(to: string, name: string, params: string[]) {
  return post({
    to: normaliseGhanaNumber(to),
    type: 'template',
    template: {
      name,
      language: { code: process.env.WHATSAPP_TEMPLATE_LOCALE || 'en' },
      components: params.length
        ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }]
        : [],
    },
  });
}

export const whatsappConfigured = configured;
export const customerTemplate = () => process.env.WHATSAPP_CUSTOMER_TEMPLATE || null;

export function ownerNumber() {
  return normaliseGhanaNumber(process.env.OWNER_WHATSAPP || SITE.contact.whatsapp);
}

/** Accepts 0545489200, +233545489200 or 233545489200 and returns E.164 digits. */
export function normaliseGhanaNumber(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0')) return '233' + digits.slice(1);
  if (digits.length === 9) return '233' + digits;
  return digits;
}

const waLink = (to: string, body: string) =>
  'https://wa.me/' + normaliseGhanaNumber(to) + '?text=' + encodeURIComponent(body);

/**
 * Adapter used by the new-booking fan-out.
 *
 * Client lifecycle messages (confirmation, reminder, decline) do NOT go
 * through here — they carry their own copy and use `sendText`/`sendTemplate`
 * directly from `notifyClient`.
 */
class WhatsAppCloudAdapter implements NotificationAdapter {
  readonly id = 'whatsapp';

  isConfigured() {
    return configured();
  }

  async notifyOwner(booking: BookingRecord): Promise<DeliveryResult> {
    const body = whatsappOwnerMessage(booking);
    const to = ownerNumber();
    const result = await sendText(to, body);
    return {
      channel: 'whatsapp',
      target: 'owner',
      delivered: result.ok,
      detail: result.detail,
      fallbackUrl: result.ok ? undefined : waLink(to, body),
    };
  }

  async notifyCustomer(booking: BookingRecord): Promise<DeliveryResult> {
    // The booking-received confirmation. Lifecycle messages use notifyClient.
    const { clientMessageText } = await import('./messages');
    const body = clientMessageText('received', booking);
    return deliverToClient(booking, body, 'received');
  }
}

/**
 * Sends a client message by the best available route.
 *
 * Template when one is configured (works at any time), free-form otherwise
 * (works inside the 24-hour window). Either way the studio gets a wa.me link
 * back on failure so the message can still be sent by hand in one tap.
 */
export async function deliverToClient(
  booking: BookingRecord,
  body: string,
  statusLine: string,
): Promise<DeliveryResult> {
  const to = booking.whatsapp;
  const template = customerTemplate();

  const result = template
    ? await sendTemplate(to, template, [
        booking.name.split(' ')[0],
        statusLine,
        booking.serviceName,
        humanDate(booking.date),
        humanTime(booking.time),
        booking.reference,
      ])
    : await sendText(to, body);

  return {
    channel: 'whatsapp',
    target: 'customer',
    delivered: result.ok,
    detail: result.detail,
    fallbackUrl: result.ok ? undefined : waLink(to, body),
  };
}

function humanDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(y, m - 1, d));
}

function humanTime(minutes: number) {
  const h24 = Math.floor(minutes / 60);
  const mm = String(minutes % 60).padStart(2, '0');
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return h12 + ':' + mm + ' ' + suffix;
}

export const whatsappAdapter: NotificationAdapter = new WhatsAppCloudAdapter();
