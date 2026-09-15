'use client';

import { useState } from 'react';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { PAYMENT_PROVIDERS, type PaymentProviderId } from '@/lib/booking/types';
import { SITE, whatsappLink } from '@/lib/data/site';
import { GHS, cn } from '@/lib/utils';
import { useBooking } from '../BookingContext';
import { Button } from '@/components/ui/Button';

export type SubmitOutcome = {
  reference: string;
  deposit: number;
  /** Whether the gateway took us to a hosted checkout. */
  depositPaidOnline: boolean;
};

export default function StepPayment({
  onComplete,
}: {
  onComplete: (outcome: SubmitOutcome) => void;
}) {
  const { draft, resolved, setErrors } = useBooking();
  const [provider, setProvider] = useState<PaymentProviderId>('paystack');
  const [state, setState] = useState<'idle' | 'submitting' | 'redirecting'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setState('submitting');
    setMessage(null);

    try {
      // 1. Record the booking and notify the studio. This must happen whether
      //    or not the gateway is live, so no enquiry is ever lost.
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, policiesAccepted: true }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (Array.isArray(data.issues)) {
          setErrors(
            Object.fromEntries(
              data.issues.map((i: { field: string; message: string }) => [i.field, i.message]),
            ),
          );
        }
        setMessage(data.error || 'We could not complete that. Please review your details.');
        setState('idle');
        return;
      }

      // 2. Start the deposit. If no gateway is configured yet, the booking
      //    still stands and the studio sends a payment link by WhatsApp.
      setState('redirecting');
      const pay = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          reference: data.reference,
          amount: data.deposit,
          email: draft.email,
          name: draft.name,
          phone: draft.phone,
          service: resolved.service?.name,
        }),
      });
      const payData = await pay.json();

      if (payData.status === 'redirect' && payData.authorizationUrl) {
        window.location.href = payData.authorizationUrl;
        return;
      }

      onComplete({
        reference: data.reference,
        deposit: data.deposit,
        depositPaidOnline: false,
      });
    } catch {
      setMessage(
        'Something interrupted the connection. Your details were not sent — please try again.',
      );
      setState('idle');
    }
  }

  const busy = state !== 'idle';

  return (
    <div>
      <div className="mb-8 rounded-2xl border border-champagne/25 bg-champagne/[0.05] px-6 py-6 text-center">
        <p className="eyebrow mb-3">Deposit due now</p>
        <p className="font-display text-[clamp(2.6rem,7vw,4rem)] font-light leading-none text-champagne">
          {GHS(resolved.deposit)}
        </p>
        <p className="mt-4 text-sm text-ivory/50">
          50% of {GHS(resolved.service?.price ?? 0)} — the balance is settled in studio.
        </p>
      </div>

      <fieldset className="mb-8">
        <legend className="eyebrow mb-4">Choose how to pay</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={cn(
                'cursor-pointer rounded-2xl border p-5 transition-all duration-500 ease-luxe',
                provider === p.id
                  ? 'border-champagne/70 bg-champagne/[0.07]'
                  : 'border-white/[0.09] hover:border-white/20',
              )}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={() => setProvider(p.id)}
                className="sr-only"
                disabled={busy}
              />
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-display text-lg text-ivory">{p.name}</span>
                <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                  {p.blurb}
                </span>
              </span>
              <span className="mt-3 flex flex-wrap gap-1.5">
                {p.methods.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-2xs text-ivory/40"
                  >
                    {m}
                  </span>
                ))}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        size="lg"
        onClick={submit}
        disabled={busy}
        className="w-full"
        aria-busy={busy}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            {state === 'submitting' ? 'Confirming your booking' : 'Opening secure checkout'}
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
            Pay {GHS(resolved.deposit)} deposit
          </>
        )}
      </Button>

      {message && (
        <p role="alert" className="mt-4 text-center text-sm text-rosegold-light">
          {message}
        </p>
      )}

      <p className="mt-6 flex items-center justify-center gap-2 text-center font-sans text-2xs uppercase tracking-luxe text-ivory/30">
        <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
        Payment is handled by the provider. We never see your card or PIN.
      </p>

      <p className="mt-6 text-center text-xs leading-relaxed text-ivory/35">
        Prefer to pay another way?{' '}
        <a
          href={whatsappLink('Hello Marilux, I would like to pay my deposit another way.')}
          target="_blank"
          rel="noopener noreferrer"
          className="text-champagne underline decoration-champagne/40 underline-offset-4"
        >
          Message us on {SITE.contact.phone}
        </a>{' '}
        and we will send a direct Mobile Money prompt.
      </p>
    </div>
  );
}
