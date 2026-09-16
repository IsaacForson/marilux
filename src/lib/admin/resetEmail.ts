import 'server-only';
import { SITE } from '@/lib/data/site';
import { emailAdapter } from '@/lib/integrations/email';
import { sendMail, smtpConfigured } from '@/lib/integrations/smtp';
import { brevoConfigured, sendViaBrevo } from '@/lib/integrations/brevo';
import { wrapHtml } from '@/lib/integrations/render';

/**
 * Sends a dashboard password reset link.
 *
 * Uses the same transports as client mail, so a studio that has email working
 * for bookings automatically has password recovery working too.
 */
export async function sendResetEmail({
  to,
  name,
  token,
}: {
  to: string;
  name: string;
  token: string;
}): Promise<{ ok: boolean; detail?: string }> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const link = base + '/admin/reset?token=' + encodeURIComponent(token);

  const subject = 'Reset your ' + SITE.name + ' dashboard password';
  const text = [
    'Hello ' + name.split(' ')[0] + ',',
    '',
    'Use this link to set a new password for the ' + SITE.name + ' dashboard:',
    link,
    '',
    'The link works once and expires in 45 minutes.',
    '',
    'If you did not ask for this, ignore this email — your password has not changed.',
  ].join('\n');

  const html = wrapHtml(
    'Use this link to set a new password:\n\n' +
      link +
      '\n\nThe link works once and expires in 45 minutes.\n\nIf you did not ask for this, ignore this email — your password has not changed.',
    'Reset your password',
  );

  if (!emailAdapter.isConfigured()) {
    // Surfaced in the server log so the owner can still recover via
    // ADMIN_PASSWORD rather than being silently stuck.
    return { ok: false, detail: 'No email transport is configured.' };
  }

  if (brevoConfigured()) {
    try {
      await sendViaBrevo({ to, subject, text, html });
      return { ok: true };
    } catch (error) {
      if (!smtpConfigured()) {
        return { ok: false, detail: error instanceof Error ? error.message : 'send failed' };
      }
    }
  }

  try {
    await sendMail({ to, subject, text, html });
    return { ok: true };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : 'send failed' };
  }
}
