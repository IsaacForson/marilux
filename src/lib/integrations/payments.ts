import 'server-only';
import type { PaymentInitResult, PaymentIntent, PaymentProvider } from './types';

/**
 * Paystack — live implementation.
 *
 * Required: PAYSTACK_SECRET_KEY
 */
class PaystackProvider implements PaymentProvider {
  readonly id = 'paystack';
  readonly name = 'Paystack';

  isConfigured() {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  }

  async initialize(intent: PaymentIntent): Promise<PaymentInitResult> {
    if (!this.isConfigured()) {
      return {
        status: 'unconfigured',
        provider: this.id,
        reason: 'PAYSTACK_SECRET_KEY is not set.',
      };
    }

    try {
      const res = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: intent.email,
          amount: intent.amountMinor,
          currency: intent.currency,
          reference: intent.reference,
          callback_url: intent.callbackUrl,
          channels: ['mobile_money', 'card', 'bank_transfer'],
          metadata: { ...intent.metadata, name: intent.name, phone: intent.phone },
        }),
      });

      const json = (await res.json()) as {
        status?: boolean;
        message?: string;
        data?: { authorization_url?: string; reference?: string };
      };

      if (!res.ok || !json.status || !json.data?.authorization_url) {
        return {
          status: 'error',
          provider: this.id,
          reason: json.message || 'Paystack responded ' + res.status,
        };
      }

      return {
        status: 'redirect',
        provider: this.id,
        authorizationUrl: json.data.authorization_url,
        reference: json.data.reference || intent.reference,
      };
    } catch (error) {
      return {
        status: 'error',
        provider: this.id,
        reason: error instanceof Error ? error.message : 'Unknown Paystack error',
      };
    }
  }

  async verify(reference: string) {
    if (!this.isConfigured()) return { paid: false, detail: 'Paystack is not configured.' };
    try {
      const res = await fetch(
        'https://api.paystack.co/transaction/verify/' + encodeURIComponent(reference),
        { headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY } },
      );
      const json = (await res.json()) as { data?: { status?: string } };
      return { paid: json.data?.status === 'success' };
    } catch (error) {
      return {
        paid: false,
        detail: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }
}

/**
 * Hubtel — live implementation of the Online Checkout API.
 *
 * Required: HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, HUBTEL_MERCHANT_ACCOUNT
 */
class HubtelProvider implements PaymentProvider {
  readonly id = 'hubtel';
  readonly name = 'Hubtel';

  isConfigured() {
    return Boolean(
      process.env.HUBTEL_CLIENT_ID &&
        process.env.HUBTEL_CLIENT_SECRET &&
        process.env.HUBTEL_MERCHANT_ACCOUNT,
    );
  }

  async initialize(intent: PaymentIntent): Promise<PaymentInitResult> {
    if (!this.isConfigured()) {
      return {
        status: 'unconfigured',
        provider: this.id,
        reason: 'Hubtel credentials are not set.',
      };
    }

    const auth = Buffer.from(
      process.env.HUBTEL_CLIENT_ID + ':' + process.env.HUBTEL_CLIENT_SECRET,
    ).toString('base64');

    try {
      const res = await fetch('https://payproxyapi.hubtel.com/items/initiate', {
        method: 'POST',
        headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: intent.amountMinor / 100,
          description: 'Marilux deposit ' + intent.reference,
          callbackUrl: intent.callbackUrl.replace('/confirm', '/api/payments/webhook'),
          returnUrl: intent.callbackUrl,
          merchantAccountNumber: process.env.HUBTEL_MERCHANT_ACCOUNT,
          clientReference: intent.reference,
        }),
      });

      const json = (await res.json()) as {
        status?: string;
        message?: string;
        data?: { checkoutUrl?: string };
      };

      if (!res.ok || !json.data?.checkoutUrl) {
        return {
          status: 'error',
          provider: this.id,
          reason: json.message || 'Hubtel responded ' + res.status,
        };
      }

      return {
        status: 'redirect',
        provider: this.id,
        authorizationUrl: json.data.checkoutUrl,
        reference: intent.reference,
      };
    } catch (error) {
      return {
        status: 'error',
        provider: this.id,
        reason: error instanceof Error ? error.message : 'Unknown Hubtel error',
      };
    }
  }

  async verify(reference: string) {
    // Hubtel confirms asynchronously via its callback; a status lookup needs the
    // merchant's transaction-status endpoint and the POS sales ID.
    return { paid: false, detail: 'Hubtel confirms via webhook for ' + reference };
  }
}

/**
 * Registry.
 *
 * Stripe and Flutterwave slot in here as additional entries implementing the
 * same `PaymentProvider` contract — nothing above this file changes.
 */
export const PROVIDERS: Record<string, PaymentProvider> = {
  paystack: new PaystackProvider(),
  hubtel: new HubtelProvider(),
};

export const getProvider = (id: string): PaymentProvider | undefined => PROVIDERS[id];

export const configuredProviders = () =>
  Object.values(PROVIDERS)
    .filter((p) => p.isConfigured())
    .map((p) => p.id);
