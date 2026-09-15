import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Clock } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/data/site';
import { ButtonLink } from '@/components/ui/Button';
import Aura from '@/components/ui/Aura';

export const metadata: Metadata = {
  title: 'Booking Confirmation — Marilux Beauty Bar',
  robots: { index: false, follow: false },
};

/**
 * Landing page for the payment gateway's return redirect.
 *
 * The gateway's `?ref=` is only a hint — a real paid/unpaid verdict comes from
 * the signed webhook, so this page reports receipt rather than asserting the
 * deposit cleared.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; status?: string }>;
}) {
  const { ref, status } = await searchParams;
  const failed = status === 'failed' || status === 'cancelled';

  return (
    <section className="relative overflow-hidden pb-32 pt-44">
      <Aura className="left-1/2 top-0 -translate-x-1/2" color="rgba(217,188,140,0.18)" size={640} />

      <div className="shell relative mx-auto max-w-2xl text-center">
        <span
          className={
            'mx-auto mb-9 grid h-20 w-20 place-items-center rounded-full border ' +
            (failed
              ? 'border-rosegold/50 bg-rosegold/10 text-danger'
              : 'border-accent/55 bg-accent/10 text-accent')
          }
        >
          {failed ? (
            <Clock className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <Check className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
          )}
        </span>

        <p className="eyebrow mb-6">{failed ? 'Payment not completed' : 'Thank you'}</p>

        <h1 className="display-lg">
          {failed ? (
            <>
              Your seat is still <span className="gold-text">held</span>.
            </>
          ) : (
            <>
              We have your <span className="gold-text">booking</span>.
            </>
          )}
        </h1>

        <p className="lede mx-auto mt-7 max-w-[50ch]">
          {failed
            ? 'The deposit did not go through, but your appointment has not been released. Message us and we will send a fresh payment link straight away.'
            : 'Your confirmation is on its way by email and WhatsApp. Once the deposit clears, your appointment is locked in.'}
        </p>

        {ref && (
          <p className="mt-8 inline-block rounded-full border border-accent/35 px-6 py-3 font-sans text-sm tracking-luxe text-accent">
            {ref}
          </p>
        )}

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink
            href={whatsappLink(
              'Hello Marilux, I am following up on booking ' + (ref ?? '') + '.',
            )}
            size="lg"
            arrow
          >
            Message the studio
          </ButtonLink>
          <ButtonLink href="/booking" variant="outline" size="lg">
            Start a new booking
          </ButtonLink>
        </div>

        <p className="mt-12 text-sm text-ivory/40">
          {SITE.address.display} ·{' '}
          <Link href="/contact" className="underline decoration-accent/40 underline-offset-4">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
