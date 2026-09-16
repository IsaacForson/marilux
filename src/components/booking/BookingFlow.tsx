'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BEZIER } from '@/lib/motion';
import type { BookingDraft } from '@/lib/booking/types';
import type { ClientCategory } from '@/lib/catalogue/shape';
import type { PublicOffer } from '@/lib/catalogue/offers';
import { BookingProvider, STEPS, useBooking } from './BookingContext';
import ProgressRail from './ProgressRail';
import SummaryPanel from './SummaryPanel';
import LeaveBookingModal from './LeaveBookingModal';
import StepCategory from './steps/StepCategory';
import StepService from './steps/StepService';
import StepSpecialist from './steps/StepSpecialist';
import StepDate from './steps/StepDate';
import StepTime from './steps/StepTime';
import StepDetails from './steps/StepDetails';
import StepNotes from './steps/StepNotes';
import StepSummary from './steps/StepSummary';
import StepPayment, { type SubmitOutcome } from './steps/StepPayment';
import Confirmation from './Confirmation';

export default function BookingFlow({
  initial,
  catalogue,
  depositPercent,
  offers,
}: {
  initial?: BookingDraft;
  catalogue: ClientCategory[];
  depositPercent: number;
  offers: PublicOffer[];
}) {
  return (
    <BookingProvider
      initial={initial}
      catalogue={catalogue}
      depositPercent={depositPercent}
      offers={offers}
    >
      <FlowInner />
    </BookingProvider>
  );
}

function FlowInner() {
  const { step, next, back, canAdvance, draft, resolved, setErrors, hasProgress, releaseDraft } =
    useBooking();
  const router = useRouter();
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(null);
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (outcome) releaseDraft();
  }, [outcome, releaseDraft]);

  useEffect(() => {
    if (!hasProgress || outcome) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|sms:|javascript:)/i.test(href)) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin === window.location.origin) {
        if (url.pathname === '/booking' || url.pathname.startsWith('/booking/')) return;
      }

      e.preventDefault();
      e.stopPropagation();
      setLeaveTo(url.href);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [hasProgress, outcome]);

  const stay = useCallback(() => setLeaveTo(null), []);
  const leave = () => {
    if (!leaveTo) return;
    const href = leaveTo;
    setLeaveTo(null);
    releaseDraft();
    try {
      const url = new URL(href, window.location.href);
      if (url.origin === window.location.origin) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
    } catch {
      /* fall through */
    }
    window.location.assign(href);
  };

  // Bring the new step into view on mobile, where the panel sits below the rail.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const top = panel.current?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.4) {
      panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  if (outcome) {
    return (
      <Confirmation
        outcome={outcome}
        summary={{
          serviceName: resolved.service?.name ?? 'Your treatment',
          specialistName: resolved.specialistName ?? 'First available',
          date: draft.date as string,
          time: draft.time as number,
          name: draft.name as string,
          email: draft.email as string,
          durationMinutes: resolved.service?.duration ?? 60,
        }}
      />
    );
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const attemptNext = () => {
    if (canAdvance) {
      next();
      return;
    }
    // Surface why the step will not advance, rather than silently refusing.
    if (current.id === 'summary') {
      setErrors({ policiesAccepted: 'Please accept the booking policy to continue.' });
      return;
    }
    if (current.id === 'details') {
      setErrors({
        ...(!draft.name || draft.name.trim().length < 2
          ? { name: 'Enter your full name' }
          : {}),
        ...(!draft.phone ? { phone: 'Enter your phone number' } : {}),
        ...(!draft.whatsapp ? { whatsapp: 'Enter your WhatsApp number' } : {}),
        ...(!draft.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
          ? { email: 'Enter a valid email address' }
          : {}),
      });
    }
  };

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[13rem,minmax(0,1fr),18rem] lg:gap-12 xl:gap-16">
      {/* Rail */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <ProgressRail />
      </div>

      {/* Step panel */}
      <div ref={panel} className="min-w-0 scroll-mt-28">
        <AnimatePresence mode="wait">
          <motion.section
            key={current.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: BEZIER.luxe }}
            aria-labelledby={'step-' + current.id}
          >
            <header className="mb-9">
              <p className="eyebrow mb-4">
                Step {step + 1} — {current.label}
              </p>
              <h2 id={'step-' + current.id} className="display-md">
                {current.title}
              </h2>
            </header>

            {current.id === 'category' && <StepCategory />}
            {current.id === 'service' && <StepService />}
            {current.id === 'specialist' && <StepSpecialist />}
            {current.id === 'date' && <StepDate />}
            {current.id === 'time' && <StepTime />}
            {current.id === 'details' && <StepDetails />}
            {current.id === 'notes' && <StepNotes />}
            {current.id === 'summary' && <StepSummary />}
            {current.id === 'payment' && <StepPayment onComplete={setOutcome} />}
          </motion.section>
        </AnimatePresence>

        {/* Controls. The payment step owns its own primary action. */}
        <div className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-7">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="group inline-flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors duration-500 hover:text-accent disabled:pointer-events-none disabled:opacity-25"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-x-0.5"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Back
          </button>

          {!isLast && (
            <button
              type="button"
              onClick={attemptNext}
              aria-disabled={!canAdvance}
              className={
                'group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 font-sans text-2xs uppercase tracking-luxe transition-all duration-500 ease-luxe ' +
                (canAdvance
                  ? 'bg-champagne text-onaccent hover:bg-champagne-light'
                  : 'border border-line-2 text-ivory/30')
              }
            >
              Continue
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>

      {/* Running summary */}
      <aside className="lg:sticky lg:top-32 lg:self-start" aria-label="Appointment summary">
        <SummaryPanel />
      </aside>
    </div>

      <LeaveBookingModal open={Boolean(leaveTo)} onStay={stay} onLeave={leave} />
    </>
  );
}
