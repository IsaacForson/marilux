import { SITE } from '@/lib/data/site';

/**
 * Studio-editable settings.
 *
 * Each group is stored as one JSON row in `public.settings`. Every field has
 * a default here, so a missing row — or a missing key inside a row — falls
 * back to what we ship rather than to undefined.
 */

export type NotificationSettings = {
  /** Where new-booking emails are sent. First address is primary. */
  ownerEmails: string[];
  /** Where new-booking texts are sent. */
  ownerPhones: string[];
  /** Number used for WhatsApp, when that channel is enabled. */
  ownerWhatsapp: string;
  /** The From address. Must be verified with the email provider. */
  fromEmail: string;
  /** Alphanumeric SMS sender, e.g. MARILUX. Must be registered with the network. */
  smsSenderId: string;
  /** Master switches, so a channel can be silenced without losing credentials. */
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  /** Send the client a text as well as an email. */
  notifyClientSms: boolean;
  notifyClientEmail: boolean;
};

export const NOTIFICATION_DEFAULTS: NotificationSettings = {
  ownerEmails: [SITE.contact.email],
  ownerPhones: [SITE.contact.phone],
  ownerWhatsapp: SITE.contact.whatsapp,
  fromEmail: SITE.contact.email,
  smsSenderId: 'MARILUX',
  emailEnabled: true,
  smsEnabled: true,
  whatsappEnabled: true,
  notifyClientSms: true,
  notifyClientEmail: true,
};

/** One editable message per lifecycle event, per channel. */
export type TemplateKind = 'received' | 'confirmed' | 'declined' | 'reminder' | 'cancelled';

export type MessageTemplate = {
  /** Empty string means "use the built-in copy". */
  emailSubject: string;
  emailBody: string;
  sms: string;
  enabled: boolean;
};

export type TemplateSettings = Record<TemplateKind, MessageTemplate>;

const blankTemplate: MessageTemplate = {
  emailSubject: '',
  emailBody: '',
  sms: '',
  enabled: true,
};

export const TEMPLATE_DEFAULTS: TemplateSettings = {
  received: { ...blankTemplate },
  confirmed: { ...blankTemplate },
  declined: { ...blankTemplate },
  reminder: { ...blankTemplate },
  cancelled: { ...blankTemplate },
};

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  received: 'Booking received',
  confirmed: 'Booking confirmed',
  reminder: 'Appointment reminder',
  declined: 'Booking declined',
  cancelled: 'Booking cancelled',
};

export const TEMPLATE_HINTS: Record<TemplateKind, string> = {
  received: 'Sent the moment a client submits a booking.',
  confirmed: 'Sent when you press Accept on a booking.',
  reminder: 'Sent the day before, by the reminder button or the daily job.',
  declined: 'Sent when you decline a booking request.',
  cancelled: 'Sent when a confirmed appointment is cancelled.',
};

/** Placeholders available in every template. */
export const TEMPLATE_TOKENS = [
  { token: '{{first_name}}', hint: 'Ama' },
  { token: '{{name}}', hint: 'Ama Owusu' },
  { token: '{{service}}', hint: 'Volume Set' },
  { token: '{{specialist}}', hint: 'Afia' },
  { token: '{{date}}', hint: 'Friday, 18 September 2026' },
  { token: '{{short_date}}', hint: 'Fri 18 Sept' },
  { token: '{{time}}', hint: '9:30 AM' },
  { token: '{{duration}}', hint: '2 hr 15 min' },
  { token: '{{price}}', hint: 'GHS 550' },
  { token: '{{deposit}}', hint: 'GHS 275' },
  { token: '{{balance}}', hint: 'GHS 275' },
  { token: '{{reference}}', hint: 'MLX-260918-KXVZC' },
  { token: '{{studio}}', hint: SITE.name },
  { token: '{{phone}}', hint: SITE.contact.phone },
  { token: '{{address}}', hint: SITE.address.display },
] as const;

/** Booking rules the studio may want to change without a deploy. */
export type BookingSettings = {
  depositPercent: number;
  /** Hours ahead of an appointment that same-day booking closes. */
  minNoticeHours: number;
  /** How far ahead the calendar opens. */
  maxAdvanceDays: number;
  /** Shown at checkout above the policy list. */
  policyNote: string;
  /** Turns the whole booking flow off, with a message. */
  bookingOpen: boolean;
  closedMessage: string;
};

export const BOOKING_DEFAULTS: BookingSettings = {
  depositPercent: 50,
  minNoticeHours: 2,
  maxAdvanceDays: 89,
  policyNote: '',
  bookingOpen: true,
  closedMessage:
    'Online booking is paused at the moment. Please message us on WhatsApp and we will find you a time.',
};

/** A site-wide banner, useful for promotions and closures. */
export type BannerSettings = {
  enabled: boolean;
  message: string;
  linkHref: string;
  linkLabel: string;
};

export const BANNER_DEFAULTS: BannerSettings = {
  enabled: false,
  message: '',
  linkHref: '/booking',
  linkLabel: 'Book now',
};

export type SettingsShape = {
  notifications: NotificationSettings;
  templates: TemplateSettings;
  booking: BookingSettings;
  banner: BannerSettings;
};

export const SETTINGS_DEFAULTS: SettingsShape = {
  notifications: NOTIFICATION_DEFAULTS,
  templates: TEMPLATE_DEFAULTS,
  booking: BOOKING_DEFAULTS,
  banner: BANNER_DEFAULTS,
};

export type SettingsKey = keyof SettingsShape;
