import 'server-only';
import { SITE } from '@/lib/data/site';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult, NotificationAdapter } from './types';
import { whatsappCustomerMessage, whatsappOwnerMessage } from './format';

/**
 * WhatsApp Business Cloud API delivery.
 *
 * Required environment variables:
 *   WHATSAPP_TOKEN            (permanent system-user access token)
 *   WHATSAPP_PHONE_NUMBER_ID  (the sending number's ID)
 *   OWNER_WHATSAPP            (E.164, digits only — defaults to the studio line)
 *
 * Note on Meta's rules: free-form text can only be sent inside a 24-hour
 * customer service window. Owner notifications are fine because the owner
 * messages the business number. Customer confirmations should use an approved
 * template — set WHATSAPP_CUSTOMER_TEMPLATE to its name once it is approved,
 * and we send the template instead of free-form text.
 */
class WhatsAppCloudAdapter implements NotificationAdapter {
  readonly id = 'whatsapp';

  isConfigured() {
    return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }

  async notifyOwner(booking: BookingRecord): Promise<DeliveryResult> {
    const to = (process.env.OWNER_WHATSAPP || SITE.contact.whatsapp).replace(/\D/g, '');
    const body = whatsappOwnerMessage(booking);
    return this.send('owner', to, { type: 'text', text: { preview_url: false, body } }, body);
  }

  async notifyCustomer(booking: BookingRecord): Promise<DeliveryResult> {
    const to = normaliseGhanaNumber(booking.whatsapp);
    const template = process.env.WHATSAPP_CUSTOMER_TEMPLATE;
    const body = whatsappCustomerMessage(booking);

    const payload = template
      ? {
          type: 'template',
          template: {
            name: template,
            language: { code: process.env.WHATSAPP_TEMPLATE_LOCALE || 'en' },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: booking.name.split(' ')[0] },
                  { type: 'text', text: booking.serviceName },
                  { type: 'text', text: booking.date },
                  { type: 'text', text: booking.reference },
                ],
              },
            ],
          },
        }
      : { type: 'text', text: { preview_url: false, body } };

    return this.send('customer', to, payload, body);
  }

  private async send(
    target: 'owner' | 'customer',
    to: string,
    payload: Record<string, unknown>,
    fallbackBody: string,
  ): Promise<DeliveryResult> {
    const fallbackUrl = 'https://wa.me/' + to + '?text=' + encodeURIComponent(fallbackBody);

    if (!this.isConfigured()) {
      return {
        channel: 'whatsapp',
        target,
        delivered: false,
        detail: 'WhatsApp Cloud API is not configured.',
        fallbackUrl,
      };
    }

    try {
      const res = await fetch(
        'https://graph.facebook.com/v21.0/' +
          process.env.WHATSAPP_PHONE_NUMBER_ID +
          '/messages',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + process.env.WHATSAPP_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messaging_product: 'whatsapp', to, ...payload }),
        },
      );

      if (!res.ok) {
        return {
          channel: 'whatsapp',
          target,
          delivered: false,
          detail: 'WhatsApp API responded ' + res.status,
          fallbackUrl,
        };
      }

      return { channel: 'whatsapp', target, delivered: true };
    } catch (error) {
      return {
        channel: 'whatsapp',
        target,
        delivered: false,
        detail: error instanceof Error ? error.message : 'Unknown WhatsApp error',
        fallbackUrl,
      };
    }
  }
}

/** Accepts 0545489200, +233545489200 or 233545489200 and returns E.164 digits. */
export function normaliseGhanaNumber(input: string) {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('233')) return digits;
  if (digits.startsWith('0')) return '233' + digits.slice(1);
  if (digits.length === 9) return '233' + digits;
  return digits;
}

export const whatsappAdapter: NotificationAdapter = new WhatsAppCloudAdapter();
