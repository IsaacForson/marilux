import type { BookingRecord } from '@/lib/booking/types';
import { SITE } from '@/lib/data/site';
import { formatDuration } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';

function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

const DEPOSIT_LABEL: Record<BookingRecord['depositStatus'], string> = {
  paid: 'PAID',
  pending: 'PENDING',
  'awaiting-link': 'AWAITING PAYMENT LINK',
  failed: 'FAILED',
};

/** The message the studio owner receives. Every field the owner asked for. */
export function ownerPlainText(b: BookingRecord) {
  return [
    'NEW BOOKING — ' + b.reference,
    '',
    'Customer name:   ' + b.name,
    'Phone:           ' + b.phone,
    'WhatsApp:        ' + b.whatsapp,
    'Email:           ' + b.email,
    '',
    'Service:         ' + b.serviceName + ' (' + b.categoryName + ')',
    'Specialist:      ' + b.specialistName,
    'Date:            ' + longDate(b.date),
    'Time:            ' + formatTime(b.time),
    'Duration:        ' + formatDuration(b.duration),
    '',
    'Total:           ' + GHS(b.price),
    'Deposit (50%):   ' + GHS(b.deposit),
    'Deposit status:  ' + DEPOSIT_LABEL[b.depositStatus],
    '',
    'Notes:           ' + (b.notes?.trim() ? b.notes.trim() : '—'),
    '',
    'Received:        ' + new Date(b.createdAt).toLocaleString('en-GB'),
  ].join('\n');
}

export function ownerHtml(b: BookingRecord) {
  const row = (label: string, value: string, strong = false) =>
    '<tr><td style="padding:7px 16px 7px 0;color:#8a8079;font:500 11px/1.4 Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;white-space:nowrap;vertical-align:top">' +
    escapeHtml(label) +
    '</td><td style="padding:7px 0;color:' +
    (strong ? '#b99863' : '#1c1a18') +
    ';font:' +
    (strong ? '600' : '400') +
    ' 15px/1.5 Helvetica,Arial,sans-serif">' +
    escapeHtml(value) +
    '</td></tr>';

  return [
    '<div style="background:#f4efe7;padding:32px">',
    '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e6ddd0;border-radius:18px;overflow:hidden">',
    '<div style="background:#0b0a09;padding:26px 28px">',
    '<p style="margin:0;color:#d9bc8c;font:500 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase">New booking</p>',
    '<p style="margin:10px 0 0;color:#fbfaf8;font:300 26px/1.2 Georgia,serif">' +
      escapeHtml(b.reference) +
      '</p>',
    '</div>',
    '<div style="padding:26px 28px"><table style="width:100%;border-collapse:collapse">',
    row('Name', b.name),
    row('Phone', b.phone),
    row('WhatsApp', b.whatsapp),
    row('Email', b.email),
    row('Service', b.serviceName),
    row('Category', b.categoryName),
    row('Specialist', b.specialistName),
    row('Date', longDate(b.date)),
    row('Time', formatTime(b.time)),
    row('Duration', formatDuration(b.duration)),
    row('Total', GHS(b.price)),
    row('Deposit', GHS(b.deposit), true),
    row('Deposit status', DEPOSIT_LABEL[b.depositStatus], true),
    row('Notes', b.notes?.trim() || '—'),
    '</table></div></div></div>',
  ].join('');
}

/** The confirmation the client receives. */
export function customerPlainText(b: BookingRecord) {
  return [
    'Hello ' + b.name.split(' ')[0] + ',',
    '',
    'Your appointment at ' + SITE.name + ' is reserved.',
    '',
    'Reference:   ' + b.reference,
    'Service:     ' + b.serviceName,
    'Specialist:  ' + b.specialistName,
    'Date:        ' + longDate(b.date),
    'Time:        ' + formatTime(b.time),
    'Duration:    ' + formatDuration(b.duration),
    'Total:       ' + GHS(b.price),
    'Deposit:     ' + GHS(b.deposit) + ' (' + DEPOSIT_LABEL[b.depositStatus] + ')',
    '',
    'A few things to know:',
    '· Please arrive 5–10 minutes early. More than 15 minutes late may mean a shortened or rescheduled service.',
    '· The 50% deposit is non-refundable, and can be transferred once with 24 hours notice.',
    '· Arrive with clean brows, lashes, face and hair unless we have advised otherwise.',
    '· Please tell us about allergies, pregnancy, skin sensitivities, medical conditions or recent cosmetic procedures.',
    '',
    'We are at ' + SITE.address.display + '.',
    'Questions: ' + SITE.contact.phone + ' (phone & WhatsApp).',
    '',
    'We look forward to seeing you.',
    SITE.name,
  ].join('\n');
}

export function customerHtml(b: BookingRecord) {
  return [
    '<div style="background:#0b0a09;padding:32px">',
    '<div style="max-width:560px;margin:0 auto;background:#14120f;border:1px solid #2a2522;border-radius:18px;overflow:hidden">',
    '<div style="padding:34px 30px 26px;text-align:center;border-bottom:1px solid #2a2522">',
    '<p style="margin:0;color:#d9bc8c;font:400 22px/1 Georgia,serif;letter-spacing:.24em">MARILUX</p>',
    '<p style="margin:8px 0 0;color:#857b74;font:500 9px/1 Helvetica,Arial,sans-serif;letter-spacing:.3em;text-transform:uppercase">Beauty Bar</p>',
    '</div>',
    '<div style="padding:30px">',
    '<p style="margin:0 0 18px;color:#f4efe7;font:300 24px/1.3 Georgia,serif">Your seat is reserved.</p>',
    '<p style="margin:0 0 24px;color:#9c938c;font:400 14px/1.7 Helvetica,Arial,sans-serif">Hello ' +
      escapeHtml(b.name.split(' ')[0]) +
      ', thank you for choosing us. Here are your details.</p>',
    '<table style="width:100%;border-collapse:collapse;border-top:1px solid #2a2522">',
    detailRow('Reference', b.reference),
    detailRow('Service', b.serviceName),
    detailRow('Specialist', b.specialistName),
    detailRow('Date', longDate(b.date)),
    detailRow('Time', formatTime(b.time)),
    detailRow('Total', GHS(b.price)),
    detailRow('Deposit', GHS(b.deposit) + ' · ' + DEPOSIT_LABEL[b.depositStatus]),
    '</table>',
    '<p style="margin:26px 0 0;color:#9c938c;font:400 13px/1.7 Helvetica,Arial,sans-serif">Please arrive 5–10 minutes early. The 50% deposit is non-refundable and may be transferred once with 24 hours notice. Do tell us about any allergies, pregnancy, skin sensitivities or recent cosmetic procedures before your appointment.</p>',
    '<p style="margin:22px 0 0;color:#857b74;font:400 13px/1.7 Helvetica,Arial,sans-serif">' +
      escapeHtml(SITE.address.display) +
      '<br>' +
      escapeHtml(SITE.contact.phone) +
      ' · phone &amp; WhatsApp</p>',
    '</div></div></div>',
  ].join('');
}

function detailRow(label: string, value: string) {
  return (
    '<tr><td style="padding:11px 16px 11px 0;border-bottom:1px solid #2a2522;color:#857b74;font:500 10px/1.4 Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.16em;white-space:nowrap">' +
    escapeHtml(label) +
    '</td><td style="padding:11px 0;border-bottom:1px solid #2a2522;color:#f4efe7;font:400 15px/1.5 Helvetica,Arial,sans-serif;text-align:right">' +
    escapeHtml(value) +
    '</td></tr>'
  );
}

/** Booking fields come from the public form — never interpolate them raw. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function whatsappOwnerMessage(b: BookingRecord) {
  return '*NEW BOOKING* — ' + b.reference + '\n\n' + ownerPlainText(b).split('\n').slice(2).join('\n');
}

export function whatsappCustomerMessage(b: BookingRecord) {
  return customerPlainText(b);
}
