'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CalendarPlus, Check, MessageCircle } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { SITE, whatsappLink } from '@/lib/data/site';
import { GHS, formatTime } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';
import Aura from '@/components/ui/Aura';
import type { SubmitOutcome } from './steps/StepPayment';

export default function Confirmation({
  outcome,
  summary,
}: {
  outcome: SubmitOutcome;
  summary: {
    serviceName: string;
    specialistName: string;
    date: string;
    time: number;
    name: string;
    email: string;
    durationMinutes: number;
  };
}) {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the confirmation so assistive tech announces the outcome.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from('[data-seal]', { scale: 0.6, opacity: 0, duration: 0.9, ease: 'back.out(1.7)' })
        .from('[data-seal-ring]', { scale: 0.4, opacity: 0, duration: 1.1 }, 0.1)
        .from(
          '[data-confirm] > *',
          { y: 22, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
          0.3,
        );
    }, root);
    return () => ctx.revert();
  }, []);

  const longDate = formatLongDate(summary.date);
  const calendarUrl = buildCalendarUrl(summary, outcome.reference);

  return (
    <div ref={root} className="relative overflow-hidden py-10 text-center">
      <Aura
        className="left-1/2 top-0 -translate-x-1/2"
        color="rgba(217,188,140,0.20)"
        size={620}
      />

      <div className="relative mx-auto max-w-2xl">
        <div className="relative mx-auto mb-10 h-24 w-24">
          <span
            data-seal-ring
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-accent/25"
          />
          <span
            data-seal
            className="absolute inset-3 grid place-items-center rounded-full border border-accent/60 bg-accent/10 text-accent"
          >
            <Check className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
          </span>
        </div>

        <div data-confirm>
          <p className="eyebrow mb-6">Booking confirmed</p>

          <h1
            ref={heading}
            tabIndex={-1}
            className="display-lg focus:outline-none"
          >
            Your seat is <span className="gold-text">reserved</span>.
          </h1>

          <p className="lede mx-auto mt-7 max-w-[48ch]">
            Thank you, {summary.name.split(' ')[0]}. We have sent a confirmation to{' '}
            <span className="text-ivory/80">{summary.email}</span> and to your WhatsApp. Your
            reference is below — keep it handy.
          </p>

          <p className="mt-8 inline-block rounded-full border border-accent/35 px-6 py-3 font-sans text-sm tracking-luxe text-accent">
            {outcome.reference}
          </p>

          <dl className="mx-auto mt-10 grid max-w-md gap-px overflow-hidden rounded-2xl border border-line bg-fill-2 text-left">
            {[
              { label: 'Treatment', value: summary.serviceName },
              { label: 'Specialist', value: summary.specialistName },
              { label: 'Date', value: longDate },
              { label: 'Time', value: formatTime(summary.time) },
              {
                label: 'Deposit',
                value: outcome.depositPaidOnline
                  ? GHS(outcome.deposit) + ' · paid'
                  : GHS(outcome.deposit) + ' · payment link to follow',
              },
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-4 bg-ink px-5 py-4">
                <dt className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                  {row.label}
                </dt>
                <dd className="text-right text-sm text-ivory/85">{row.value}</dd>
              </div>
            ))}
          </dl>

          {!outcome.depositPaidOnline && (
            <p className="mx-auto mt-6 max-w-[52ch] rounded-2xl border border-rosegold/25 bg-rosegold/[0.05] px-5 py-4 text-sm leading-relaxed text-ivory/60">
              Your appointment is held. We will send your 50% deposit link on WhatsApp shortly —
              the booking is confirmed once that deposit is received.
            </p>
          )}

          <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={calendarUrl} size="lg" arrow>
              <CalendarPlus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Add to calendar
            </ButtonLink>
            <ButtonLink
              href={whatsappLink(
                'Hello Marilux, this is about booking ' +
                  outcome.reference +
                  ' for ' +
                  summary.serviceName +
                  '.',
              )}
              variant="outline"
              size="lg"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              Message the studio
            </ButtonLink>
          </div>

          <p className="mt-12 text-sm leading-relaxed text-ivory/45">
            Please arrive 5–10 minutes early at {SITE.address.display}. Come with clean brows,
            lashes, face and hair unless we have advised otherwise.
          </p>

          <p className="mt-8">
            <Link
              href="/services"
              className="font-sans text-2xs uppercase tracking-luxe text-ivory/40 underline decoration-accent/40 underline-offset-8 transition-colors hover:text-accent"
            >
              Browse more treatments
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function formatLongDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

/** Google Calendar template link — no API, no auth, works everywhere. */
function buildCalendarUrl(
  s: { serviceName: string; date: string; time: number; durationMinutes: number },
  reference: string,
) {
  const [y, m, d] = s.date.split('-').map(Number);
  const start = new Date(y, m - 1, d, Math.floor(s.time / 60), s.time % 60);
  const end = new Date(start.getTime() + s.durationMinutes * 60_000);
  const stamp = (dt: Date) =>
    dt.getFullYear() +
    String(dt.getMonth() + 1).padStart(2, '0') +
    String(dt.getDate()).padStart(2, '0') +
    'T' +
    String(dt.getHours()).padStart(2, '0') +
    String(dt.getMinutes()).padStart(2, '0') +
    '00';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: s.serviceName + ' at ' + SITE.name,
    dates: stamp(start) + '/' + stamp(end),
    details: 'Booking reference ' + reference + '. Please arrive 5–10 minutes early.',
    location: SITE.address.display,
  });

  return 'https://calendar.google.com/calendar/render?' + params.toString();
}
