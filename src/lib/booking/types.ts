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
  createdAt: string;
};

export type DepositStatus = 'pending' | 'paid' | 'awaiting-link' | 'failed';

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
