import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';
import { SITE } from '@/lib/data/site';

/**
 * SMTP transport.
 *
 * This is the path most studios will actually use: a Gmail address plus an
 * App Password, no OAuth client, no Google Cloud project. It also works with
 * any other provider (Brevo, Zoho, Mailgun, a host's own SMTP).
 *
 * Required:
 *   SMTP_HOST      e.g. smtp.gmail.com
 *   SMTP_PORT      465 (secure) or 587 (STARTTLS)
 *   SMTP_USER      the mailbox address
 *   SMTP_PASSWORD  an App Password — never the account password
 */
let cached: Transporter | null = null;

export function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
  );
}

function transport(): Transporter {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 upgrades with STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    // A hung SMTP handshake must not hold a request open indefinitely.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return cached;
}

export async function sendMail({
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
  await transport().sendMail({
    from: '"' + SITE.name + '" <' + (process.env.SMTP_FROM || process.env.SMTP_USER) + '>',
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

/** Surfaced in the admin dashboard so the studio can see what is live. */
export async function verifySmtp() {
  if (!smtpConfigured()) return { ok: false, detail: 'SMTP is not configured.' };
  try {
    await transport().verify();
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      detail: error instanceof Error ? error.message : 'SMTP verification failed',
    };
  }
}
