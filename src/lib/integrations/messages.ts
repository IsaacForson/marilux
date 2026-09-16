import type { BookingRecord } from '@/lib/booking/types';
import { SITE } from '@/lib/data/site';
import { formatDuration } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';
import { escapeHtml } from './format';
import { render, tokensFor, wrapHtml } from './render';
import type { MessageTemplate } from '@/lib/settings/types';

export type MessageKind = 'received' | 'confirmed' | 'declined' | 'reminder' | 'cancelled';

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
  {
    subject: (b: BookingRecord) => string;
    heading: string;
    body: (b: BookingRecord) => string[];
    /** One sentence. Fills {{2}} in the WhatsApp template. */
    status: string;
  }
> = {
  received: {
    subject: (b) => 'We have your booking · ' + b.reference,
    heading: 'Your seat is reserved.',
    status: 'We have received your booking and will confirm it shortly.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'Thank you for booking with ' +
        SITE.name +
        '. We have your request and will confirm it shortly.',
      'Please arrive 5–10 minutes early. The 50% deposit is non-refundable and may be transferred once with 24 hours notice.',
    ],
  },
  confirmed: {
    subject: (b) => 'Confirmed — your appointment on ' + longDate(b.date) + ' · ' + b.reference,
    heading: 'You are confirmed.',
    status: 'Your appointment is confirmed.',
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
    status: 'Unfortunately we cannot take this appointment.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'We are sorry — we are not able to take your requested appointment. Any deposit paid will be returned in full.',
      'We would still love to see you. Reply to this email or message us on WhatsApp and we will find you another time.',
    ],
  },
  reminder: {
    // "Tomorrow" has to be earned: the studio can send a reminder by hand at
    // any point, not only the day before.
    subject: (b) => {
      const when = whenPhrase(b.date);
      return when
        ? capitalise(when) + ' at ' + formatTime(b.time) + ' — see you soon · ' + b.reference
        : 'A reminder — ' + shortDate(b.date) + ' at ' + formatTime(b.time) + ' · ' + b.reference;
    },
    heading: 'We are looking forward to it.',
    status: 'This is a reminder of your appointment.',
    body: (b) => [
      'Hello ' + b.name.split(' ')[0] + ',',
      'This is a gentle reminder of your appointment at ' +
        SITE.name +
        (whenPhrase(b.date) ? ', ' + whenPhrase(b.date) : '') +
        '.',
      'Please arrive 5–10 minutes early, and come with clean brows, lashes, face and hair unless we have advised otherwise. Arriving more than 15 minutes late may mean a shortened or rescheduled service.',
    ],
  },
  cancelled: {
    subject: (b) => 'Your appointment has been cancelled · ' + b.reference,
    heading: 'Your appointment is cancelled.',
    status: 'Your appointment has been cancelled.',
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

/** The one-line status sentence carried by the WhatsApp template. */
export const clientStatusLine = (kind: MessageKind) => COPY[kind].status;


/* ------------------------------------------------------------------ */
/* SMS                                                                 */
/* ------------------------------------------------------------------ */

/**
 * SMS is billed per 160-character segment, so these are written tight —
 * everything that matters, nothing that does not. GSM-7 only: no em dashes,
 * no curly quotes, no accents, or the whole message drops to 70 characters
 * per segment and costs more than twice as much.
 */
const SMS_LEAD: Record<MessageKind, string> = {
  received: 'Booking received.',
  confirmed: 'Booking CONFIRMED.',
  declined: 'Sorry, we cannot take this booking.',
  reminder: 'Reminder of your appointment.',
  cancelled: 'Your appointment has been cancelled.',
};

/**
 * Days from today to the appointment, in local time.
 *
 * The bulk reminder runs the day before, but the studio can also send one by
 * hand at any point — so "tomorrow" has to be earned, not assumed.
 */
function daysAway(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

const capitalise = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

const whenPhrase = (isoDate: string) => {
  const days = daysAway(isoDate);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return null;
};

export function clientSms(kind: MessageKind, b: BookingRecord) {
  const when = whenPhrase(b.date);
  const lead =
    kind === 'reminder' && when
      ? 'Reminder: your appointment is ' + when + '.'
      : SMS_LEAD[kind];

  const lines = [
    SITE.shortName + ': ' + lead,
    b.serviceName,
    shortDate(b.date) + ' at ' + formatTime(b.time),
    'Ref ' + b.reference,
  ];

  if (kind === 'declined') {
    lines.push('Any deposit is refunded. Call ' + SITE.contact.phone + '.');
  } else if (kind !== 'cancelled') {
    lines.push('Arrive 5-10 min early. ' + SITE.contact.phone);
  } else {
    lines.push('Call ' + SITE.contact.phone + ' to rebook.');
  }

  return gsm(lines.join('\n'));
}

/** What the studio gets the moment a booking lands. */
export function ownerSms(b: BookingRecord) {
  const lines = [
    'NEW BOOKING ' + b.reference,
    b.name + ' ' + b.phone,
    b.serviceName,
    shortDate(b.date) + ' at ' + formatTime(b.time),
    'GHS ' + b.price + ', deposit GHS ' + b.deposit,
  ];
  if (b.notes?.trim()) lines.push('Note: ' + b.notes.trim().slice(0, 90));
  return gsm(lines.join('\n'));
}

function shortDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(y, m - 1, d));
}

/**
 * Forces the message into the GSM-7 alphabet.
 *
 * A single curly apostrophe from a client note would switch the entire SMS to
 * UCS-2 and halve the characters per segment, so the substitutions matter.
 */
function gsm(text: string) {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Segment count, so the studio can see what a message costs. */
export function smsSegments(text: string) {
  const unicode = /[^\u0000-\u007F\u00A3\u00A5\u00E8\u00E9\u00F9\u00EC\u00F2\u00C7\u00D8\u00F8\u00C5\u00E5\u00C6\u00E6\u00DF\u00C9\u00A4\u00A1\u00C4\u00D6\u00D1\u00DC\u00A7\u00BF\u00E4\u00F6\u00F1\u00FC\u00E0]/.test(text);
  const per = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  return text.length <= per ? 1 : Math.ceil(text.length / multi);
}


/* ------------------------------------------------------------------ */
/* Studio-authored overrides                                           */
/* ------------------------------------------------------------------ */

export type RenderedMessage = {
  subject: string;
  text: string;
  html: string;
  sms: string;
  /** False when the studio has switched this message off entirely. */
  enabled: boolean;
};

/**
 * Builds the message for one lifecycle event.
 *
 * A template field left empty means "use the copy we ship" — so a studio can
 * rewrite only the SMS and keep our email, or vice versa, without having to
 * rewrite everything to change one line.
 */
export function buildMessage(
  kind: MessageKind,
  b: BookingRecord,
  template?: MessageTemplate,
): RenderedMessage {
  const tokens = tokensFor(b);

  const subject = template?.emailSubject?.trim()
    ? render(template.emailSubject, tokens)
    : clientMessageSubject(kind, b);

  const bodyOverride = template?.emailBody?.trim();
  const text = bodyOverride ? render(bodyOverride, tokens) : clientMessageText(kind, b);
  const html = bodyOverride
    ? wrapHtml(text, COPY[kind].heading)
    : clientMessageHtml(kind, b);

  const smsOverride = template?.sms?.trim();
  const sms = smsOverride ? gsm(render(smsOverride, tokens)) : clientSms(kind, b);

  return { subject, text, html, sms, enabled: template?.enabled !== false };
}

/** Preview for the template editor, using a realistic sample booking. */
export const SAMPLE_BOOKING: BookingRecord = {
  reference: 'MLX-260918-KXVZC',
  name: 'Ama Owusu',
  email: 'ama@example.com',
  phone: '0244123456',
  whatsapp: '0244123456',
  categorySlug: 'lashes',
  categoryName: 'Lashes',
  serviceSlug: 'volume-set',
  serviceName: 'Volume Set',
  specialistSlug: 'afia',
  specialistName: 'Afia',
  duration: 135,
  date: '2026-09-18',
  time: 570,
  price: 550,
  deposit: 275,
  depositStatus: 'paid',
  status: 'confirmed',
  notes: 'First visit. Sensitive eyes.',
  policiesAccepted: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
