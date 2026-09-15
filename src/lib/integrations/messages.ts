import type { BookingRecord } from '@/lib/booking/types';
import { SITE } from '@/lib/data/site';
import { formatDuration } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';
import { escapeHtml } from './format';

export type MessageKind = 'confirmed' | 'declined' | 'reminder' | 'cancelled';

function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

const COPY: Record<
  MessageKind,
  { subject: (b: BookingRecord) => string; heading: string; body: (b: BookingRecord) => string[] }
> = {
  confirmed: {
    subject: (b) => 'Confirmed — your appointment on ' + longDate(b.date) + ' · ' + b.reference,
    heading: 'You are confirmed.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'Your appointment at ' +
        SITE.name +
        ' is confirmed. We have set the room aside for you and your specialist has your notes.',
      'Please arrive 5–10 minutes early. If anything changes, give us 24 hours notice and we will happily move it.',
    ],
  },
  declined: {
    subject: (b) => 'About your booking request · ' + b.reference,
    heading: 'We could not take this one.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'We are sorry — we are not able to take your requested appointment. Any deposit paid will be returned in full.',
      'We would still love to see you. Reply to this email or message us on WhatsApp and we will find you another time.',
    ],
  },
  reminder: {
    subject: (b) => 'Tomorrow at ' + formatTime(b.time) + ' — see you soon · ' + b.reference,
    heading: 'We are looking forward to it.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'This is a gentle reminder of your appointment at ' + SITE.name + '.',
      'Please arrive 5–10 minutes early, and come with clean brows, lashes, face and hair unless we have advised otherwise. Arriving more than 15 minutes late may mean a shortened or rescheduled service.',
    ],
  },
  cancelled: {
    subject: (b) => 'Your appointment has been cancelled · ' + b.reference,
    heading: 'Your appointment is cancelled.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'Your appointment at ' + SITE.name + ' has been cancelled.',
      'If this was not what you expected, please reply to this email or message us and we will put it right.',
    ],
  },
};

const rows = (b: BookingRecord) => [
  ['Reference', b.reference],
  ['Treatment', b.serviceName],
  ['Specialist', b.specialistName],
  ['Date', longDate(b.date)],
  ['Time', formatTime(b.time)],
  ['Duration', formatDuration(b.duration)],
  ['Total', GHS(b.price)],
  ['Deposit', GHS(b.deposit) + (b.depositStatus === 'paid' ? ' · paid' : ' · ' + b.depositStatus)],
];

export function clientMessageText(kind: MessageKind, b: BookingRecord) {
  const copy = COPY[kind];
  return [
    ...copy.body(b),
    '',
    ...rows(b).map(([k, v]) => k.padEnd(12) + ' ' + v),
    '',
    SITE.address.display,
    SITE.contact.phone + ' · phone & WhatsApp',
    SITE.name,
  ].join('\n');
}

export function clientMessageHtml(kind: MessageKind, b: BookingRecord) {
  const copy = COPY[kind];
  const accent = kind === 'declined' || kind === 'cancelled' ? '#c08a7e' : '#d9bc8c';

  return [
    '<div style="background:#0b0a09;padding:32px">',
    '<div style="max-width:560px;margin:0 auto;background:#14120f;border:1px solid #2a2522;border-radius:18px;overflow:hidden">',
    '<div style="padding:34px 30px 26px;text-align:center;border-bottom:1px solid #2a2522">',
    '<p style="margin:0;color:' +
      accent +
      ';font:400 22px/1 Georgia,serif;letter-spacing:.24em">MARILUX</p>',
    '<p style="margin:8px 0 0;color:#857b74;font:500 9px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase">Beauty Bar</p>',
    '</div>',
    '<div style="padding:30px">',
    '<p style="margin:0 0 20px;color:#f4efe7;font:300 24px/1.3 Georgia,serif">' +
      escapeHtml(copy.heading) +
      '</p>',
    ...copy
      .body(b)
      .map(
        (para) =>
          '<p style="margin:0 0 14px;color:#9c938c;font:400 14px/1.7 Helvetica,Arial,sans-serif">' +
          escapeHtml(para) +
          '</p>',
      ),
    '<table style="width:100%;border-collapse:collapse;border-top:1px solid #2a2522;margin-top:12px">',
    ...rows(b).map(
      ([k, v]) =>
        '<tr><td style="padding:11px 16px 11px 0;border-bottom:1px solid #2a2522;color:#857b74;font:500 10px/1.4 Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.16em;white-space:nowrap">' +
        escapeHtml(k) +
        '</td><td style="padding:11px 0;border-bottom:1px solid #2a2522;color:#f4efe7;font:400 15px/1.5 Helvetica,Arial,sans-serif;text-align:right">' +
        escapeHtml(v) +
        '</td></tr>',
    ),
    '</table>',
    b.notes?.trim()
      ? '<p style="margin:20px 0 0;color:#857b74;font:400 13px/1.7 Helvetica,Arial,sans-serif"><strong style="color:#9c938c">Your notes:</strong> ' +
        escapeHtml(b.notes.trim()) +
        '</p>'
      : '',
    '<p style="margin:24px 0 0;color:#857b74;font:400 13px/1.7 Helvetica,Arial,sans-serif">' +
      escapeHtml(SITE.address.display) +
      '<br>' +
      escapeHtml(SITE.contact.phone) +
      ' · phone &amp; WhatsApp</p>',
    '</div></div></div>',
  ]
    .filter(Boolean)
    .join('');
}

export const clientMessageSubject = (kind: MessageKind, b: BookingRecord) =>
  COPY[kind].subject(b);
