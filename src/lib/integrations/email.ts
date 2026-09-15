import 'server-only';
import { SITE } from '@/lib/data/site';
import type { BookingRecord } from '@/lib/booking/types';
import type { DeliveryResult, NotificationAdapter } from './types';
import { sendMail, smtpConfigured } from './smtp';
import { customerHtml, customerPlainText, ownerHtml, ownerPlainText } from './format';

/**
 * Email delivery.
 *
 * Two transports, tried in order:
 *   1. SMTP — a Gmail App Password (or any provider). Simplest to set up, and
 *      what most studios will use.
 *   2. Gmail API via OAuth2 — no app password needed, and sent mail lands in
 *      the studio's own Sent folder.
 *
 * Whichever is configured wins; if both are, SMTP is used because it has
 * fewer moving parts.
 *
 * ---
 * Gmail API notes.
 *
 * Uses an OAuth2 refresh token belonging to the studio's Google account, which
 * avoids app passwords and keeps sent mail in the studio's own Sent folder.
 *
 * Required environment variables:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REFRESH_TOKEN
 *   GMAIL_SENDER          (defaults to the studio address)
 *   OWNER_EMAIL           (defaults to the studio address)
 */
class GmailAdapter implements NotificationAdapter {
  readonly id = 'gmail';

  isConfigured() {
    return smtpConfigured() || this.gmailApiConfigured();
  }

  private gmailApiConfigured() {
    return Boolean(
      process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN,
    );
  }

  async notifyOwner(booking: BookingRecord): Promise<DeliveryResult> {
    return this.send({
      target: 'owner',
      to: process.env.OWNER_EMAIL || SITE.contact.email,
      subject:
        'New booking · ' +
        booking.serviceName +
        ' · ' +
        booking.date +
        ' · ' +
        booking.reference,
      text: ownerPlainText(booking),
      html: ownerHtml(booking),
      replyTo: booking.email,
    });
  }

  async notifyCustomer(booking: BookingRecord): Promise<DeliveryResult> {
    return this.send({
      target: 'customer',
      to: booking.email,
      subject: 'Your appointment at ' + SITE.name + ' · ' + booking.reference,
      text: customerPlainText(booking),
      html: customerHtml(booking),
    });
  }

  private async send({
    target,
    to,
    subject,
    text,
    html,
    replyTo,
  }: {
    target: 'owner' | 'customer';
    to: string;
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
  }): Promise<DeliveryResult> {
    if (!this.isConfigured()) {
      return {
        channel: 'email',
        target,
        delivered: false,
        detail:
          'No email transport configured. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD, ' +
          'or the Gmail API variables.',
      };
    }

    if (smtpConfigured()) {
      try {
        await sendMail({ to, subject, text, html, replyTo });
        return { channel: 'email', target, delivered: true };
      } catch (error) {
        return {
          channel: 'email',
          target,
          delivered: false,
          detail: 'SMTP: ' + (error instanceof Error ? error.message : 'send failed'),
        };
      }
    }

    try {
      const accessToken = await this.accessToken();
      const raw = buildMime({
        from: SITE.name + ' <' + (process.env.GMAIL_SENDER || SITE.contact.email) + '>',
        to,
        subject,
        text,
        html,
        replyTo,
      });

      const res = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw }),
        },
      );

      if (!res.ok) {
        return {
          channel: 'email',
          target,
          delivered: false,
          detail: 'Gmail API responded ' + res.status,
        };
      }

      return { channel: 'email', target, delivered: true };
    } catch (error) {
      return {
        channel: 'email',
        target,
        delivered: false,
        detail: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }

  private async accessToken() {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN as string,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error('Token exchange failed with ' + res.status);
    const json = (await res.json()) as { access_token?: string };
    if (!json.access_token) throw new Error('Token exchange returned no access token');
    return json.access_token;
  }
}

/** RFC 2822 multipart message, base64url encoded as the Gmail API expects. */
function buildMime({
  from,
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const boundary = 'mlx_' + Math.random().toString(36).slice(2);
  const lines = [
    'From: ' + from,
    'To: ' + to,
    replyTo ? 'Reply-To: ' + replyTo : '',
    'Subject: =?UTF-8?B?' + Buffer.from(subject, 'utf8').toString('base64') + '?=',
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(text, 'utf8').toString('base64'),
    '',
    '--' + boundary,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html, 'utf8').toString('base64'),
    '',
    '--' + boundary + '--',
  ].filter(Boolean);

  return Buffer.from(lines.join('\r\n'), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const emailAdapter: NotificationAdapter = new GmailAdapter();
