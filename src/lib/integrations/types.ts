import type { BookingRecord } from '@/lib/booking/types';

export type DeliveryResult = {
  channel: 'email' | 'whatsapp';
  target: 'owner' | 'customer';
  delivered: boolean;
  /** Present when delivery was skipped or failed — surfaced in logs, never to the client. */
  detail?: string;
  /** A link the studio can use to complete the notification by hand. */
  fallbackUrl?: string;
};

export type NotificationAdapter = {
  readonly id: string;
  /** False when the required environment variables are absent. */
  isConfigured(): boolean;
  notifyOwner(booking: BookingRecord): Promise<DeliveryResult>;
  notifyCustomer(booking: BookingRecord): Promise<DeliveryResult>;
};

export type PaymentIntent = {
  reference: string;
  amountMinor: number;
  currency: 'GHS';
  email: string;
  name: string;
  phone: string;
  callbackUrl: string;
  metadata: Record<string, string | number>;
};

export type PaymentInitResult =
  | { status: 'redirect'; authorizationUrl: string; provider: string; reference: string }
  | { status: 'unconfigured'; provider: string; reason: string }
  | { status: 'error'; provider: string; reason: string };

export type PaymentProvider = {
  readonly id: string;
  readonly name: string;
  isConfigured(): boolean;
  initialize(intent: PaymentIntent): Promise<PaymentInitResult>;
  /** Verifies a provider callback/webhook and reports whether the deposit cleared. */
  verify(reference: string): Promise<{ paid: boolean; detail?: string }>;
};
