import { z } from 'zod';

export const ghPhone = z
  .string()
  .trim()
  .min(9, 'Enter a valid phone number')
  .max(20, 'Enter a valid phone number')
  .regex(/^[+\d][\d\s()-]{8,19}$/, 'Enter a valid phone number');

/** Validated on both the client and the API route — one schema, one truth. */
export const bookingSchema = z.object({
  categorySlug: z.string().min(1),
  serviceSlug: z.string().min(1),
  specialistSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  time: z.number().int().min(0).max(1439),
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  phone: ghPhone,
  whatsapp: ghPhone,
  email: z.string().trim().email('Enter a valid email address').max(120),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  policiesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the booking policy to continue' }),
  }),
  /** Optional coupon typed at checkout. Validated server-side. */
  promoCode: z.string().trim().max(40).optional().or(z.literal('')),
  /** Honeypot — must stay empty. */
  company: z.string().max(0).optional().or(z.literal('')),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type BookingDraft = Partial<Omit<BookingInput, 'policiesAccepted'>> & {
  policiesAccepted?: boolean;
};

export type BookingRecord = BookingInput & {
  reference: string;
  serviceName: string;
  categoryName: string;
  specialistName: string;
  duration: number;
  price: number;
  deposit: number;
  depositStatus: DepositStatus;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  /** Timestamps so the studio can see what the client has already received. */
  confirmationSentAt?: string;
  reminderSentAt?: string;
  /** Free-text note the studio adds when declining or cancelling. */
  staffNote?: string;
  paymentProvider?: string;
  paymentReference?: string;
  /** Price before any discount, present only when one was applied. */
  originalPrice?: number;
  discountAmount?: number;
};

export type DepositStatus = 'pending' | 'paid' | 'awaiting-link' | 'refunded' | 'failed';

/**
 * Lifecycle of a booking as the studio sees it.
 *
 * `pending` — submitted by the client, not yet reviewed.
 * `confirmed` — the studio has accepted and the slot is held.
 * `declined` — the studio could not take it.
 * `completed` — the appointment happened.
 * `cancelled` — called off after confirmation, by either side.
 * `no-show` — the client did not arrive; the deposit is forfeited.
 */
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'completed',
  'declined',
  'cancelled',
  'no-show',
];

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Awaiting review',
  confirmed: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No-show',
};

/** Revenue is only counted once an appointment has actually happened. */
export const EARNING_STATUSES: BookingStatus[] = ['completed'];
/** These still hold a slot in the diary. */
export const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed'];

export const PAYMENT_PROVIDERS = [
  {
    id: 'paystack',
    name: 'Paystack',
    blurb: 'Mobile Money and card',
    methods: ['MTN MoMo', 'Telecel Cash', 'Visa', 'Mastercard'],
  },
  {
    id: 'hubtel',
    name: 'Hubtel',
    blurb: 'Ghana Mobile Money',
    methods: ['MTN MoMo', 'AT Money', 'Telecel Cash'],
  },
] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number]['id'];

/** Human-readable, non-sequential so it cannot be used to infer volume. */
export function makeReference() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tail = '';
  for (let i = 0; i < 5; i += 1) {
    tail += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const now = new Date();
  const stamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  return 'MLX-' + stamp + '-' + tail;
}
