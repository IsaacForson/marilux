import 'server-only';
import { SITE } from '@/lib/data/site';

/**
 * Brevo transactional email over HTTPS.
 *
 * Preferred over SMTP in production because many serverless platforms
 * (Vercel, Netlify, Cloudflare) block or throttle outbound connections on
 * ports 465/587. An HTTPS call always gets through, and Brevo returns a
 * messageId we can log.
 *
 * Requires BREVO_API_KEY. The sender must be verified in Brevo under
 * "Senders, domains, IPs" or the API rejects the send.
 */
export function brevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function sendViaBrevo({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}) {
  const sender = process.env.SMTP_FROM || process.env.BREVO_SENDER || SITE.contact.email;

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY as string,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: SITE.name, email: sender },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let detail = body.slice(0, 200);
    try {
      const json = JSON.parse(body) as { message?: string; code?: string };
      detail = [json.message, json.code && '(' + json.code + ')'].filter(Boolean).join(' ');
    } catch {
      // Keep the raw body.
    }
    throw new Error('Brevo API: ' + (detail || 'HTTP ' + res.status));
  }

  const json = (await res.json().catch(() => ({}))) as { messageId?: string };
  return { messageId: json.messageId };
}
