import type { BookingRecord } from '@/lib/booking/types';
import { SITE } from '@/lib/data/site';
import { formatDuration } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';

/**
 * Template rendering.
 *
 * Studio-authored templates are plain text with {{token}} placeholders. An
 * unknown token is left visible rather than silently blanked — a studio that
 * mistypes {{firstname}} should see it in their own test send, not discover it
 * from a client.
 */
export function tokensFor(b: BookingRecord): Record<string, string> {
  const [y, m, d] = b.date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);

  return {
    first_name: b.name.split(' ')[0],
    name: b.name,
    service: b.serviceName,
    category: b.categoryName,
    specialist: b.specialistName,
    date: new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj),
    short_date: new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(dateObj),
    time: formatTime(b.time),
    duration: formatDuration(b.duration),
    price: GHS(b.price),
    deposit: GHS(b.deposit),
    balance: GHS(b.price - b.deposit),
    reference: b.reference,
    notes: b.notes?.trim() || '',
    studio: SITE.name,
    phone: SITE.contact.phone,
    email: SITE.contact.email,
    address: SITE.address.display,
  };
}

export function render(template: string, tokens: Record<string, string>) {
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
    const value = tokens[key.toLowerCase()];
    return value === undefined ? match : value;
  });
}

/** Which tokens in a template are not recognised. Used by the editor. */
export function unknownTokens(template: string, known: readonly string[]) {
  const used = [...template.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi)].map((m) =>
    m[1].toLowerCase(),
  );
  return [...new Set(used.filter((t) => !known.includes(t)))];
}

/** Wraps studio-authored plain text in the branded email shell. */
export function wrapHtml(body: string, heading: string, accent = '#d9bc8c') {
  const paragraphs = body
    .split(/\n{2,}/)
    .map(
      (p) =>
        '<p style="margin:0 0 14px;color:#9c938c;font:400 14px/1.7 Helvetica,Arial,sans-serif">' +
        escape(p).replace(/\n/g, '<br>') +
        '</p>',
    )
    .join('');

  return [
    '<div style="background:#0b0a09;padding:32px">',
    '<div style="max-width:560px;margin:0 auto;background:#14120f;border:1px solid #2a2522;border-radius:18px;overflow:hidden">',
    '<div style="padding:34px 30px 26px;text-align:center;border-bottom:1px solid #2a2522">',
    '<p style="margin:0;color:' +
      accent +
      ';font:400 22px/1 Georgia,serif;letter-spacing:.24em">MARILUX</p>',
    '<p style="margin:8px 0 0;color:#857b74;font:500 9px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase">Beauty Bar</p>',
    '</div><div style="padding:30px">',
    '<p style="margin:0 0 20px;color:#f4efe7;font:300 24px/1.3 Georgia,serif">' +
      escape(heading) +
      '</p>',
    paragraphs,
    '<p style="margin:24px 0 0;color:#857b74;font:400 13px/1.7 Helvetica,Arial,sans-serif">' +
      escape(SITE.address.display) +
      '<br>' +
      escape(SITE.contact.phone) +
      ' &middot; phone &amp; WhatsApp</p>',
    '</div></div></div>',
  ].join('');
}

function escape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
