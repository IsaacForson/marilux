'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getCategory, getService, depositFor } from '@/lib/data/services';
import { SPECIALISTS } from '@/lib/data/team';
import type { BookingDraft } from '@/lib/booking/types';

export const STEPS = [
  { id: 'category', label: 'Category', title: 'Where shall we begin?' },
  { id: 'service', label: 'Service', title: 'Choose your treatment.' },
  { id: 'specialist', label: 'Specialist', title: 'Who would you like?' },
  { id: 'date', label: 'Date', title: 'Pick your day.' },
  { id: 'time', label: 'Time', title: 'And your time.' },
  { id: 'details', label: 'Details', title: 'Tell us who you are.' },
  { id: 'notes', label: 'Notes', title: 'Anything we should know?' },
  { id: 'summary', label: 'Summary', title: 'Before we confirm.' },
  { id: 'payment', label: 'Deposit', title: 'Secure your seat.' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];

type BookingContextValue = {
  draft: BookingDraft;
  step: number;
  /** Highest step the guest has reached — lets them jump back and forth. */
  furthest: number;
  set: (patch: BookingDraft) => void;
  goTo: (index: number) => void;
  next: () => void;
  back: () => void;
  canAdvance: boolean;
  resolved: {
    category?: ReturnType<typeof getCategory>;
    service?: ReturnType<typeof getService>;
    specialistName?: string;
    deposit: number;
  };
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
};

const Ctx = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used inside <BookingProvider>');
  return ctx;
}

export function BookingProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: BookingDraft;
}) {
  const [draft, setDraft] = useState<BookingDraft>(initial ?? { specialistSlug: 'any' });
  const [step, setStep] = useState(() => firstIncompleteStep(initial));
  const [furthest, setFurthest] = useState(step);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = useCallback((patch: BookingDraft) => {
    setDraft((prev) => {
      const nextDraft = { ...prev, ...patch };
      // Changing the category invalidates everything chosen beneath it.
      if (patch.categorySlug && patch.categorySlug !== prev.categorySlug) {
        nextDraft.serviceSlug = undefined;
        nextDraft.specialistSlug = 'any';
        nextDraft.time = undefined;
      }
      // A different service means a different duration, so the slot must go.
      if (patch.serviceSlug && patch.serviceSlug !== prev.serviceSlug) {
        nextDraft.time = undefined;
      }
      if (patch.specialistSlug && patch.specialistSlug !== prev.specialistSlug) {
        nextDraft.time = undefined;
      }
      if (patch.date && patch.date !== prev.date) {
        nextDraft.time = undefined;
      }
      return nextDraft;
    });
    setErrors({});
  }, []);

  const resolved = useMemo(() => {
    const category = draft.categorySlug ? getCategory(draft.categorySlug) : undefined;
    const service =
      draft.categorySlug && draft.serviceSlug
        ? getService(draft.categorySlug, draft.serviceSlug)
        : undefined;
    const specialistName =
      !draft.specialistSlug || draft.specialistSlug === 'any'
        ? 'First available'
        : SPECIALISTS.find((s) => s.slug === draft.specialistSlug)?.name;
    return {
      category,
      service,
      specialistName,
      deposit: service ? depositFor(service.price) : 0,
    };
  }, [draft.categorySlug, draft.serviceSlug, draft.specialistSlug]);

  const canAdvance = useMemo(() => isStepComplete(STEPS[step].id, draft), [step, draft]);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
      setStep(clamped);
      setFurthest((f) => Math.max(f, clamped));
      setErrors({});
    },
    [],
  );

  const next = useCallback(() => goTo(step + 1), [goTo, step]);
  const back = useCallback(() => goTo(step - 1), [goTo, step]);

  const value = useMemo(
    () => ({
      draft,
      step,
      furthest,
      set,
      goTo,
      next,
      back,
      canAdvance,
      resolved,
      errors,
      setErrors,
    }),
    [draft, step, furthest, set, goTo, next, back, canAdvance, resolved, errors],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function isStepComplete(id: StepId, d: BookingDraft): boolean {
  switch (id) {
    case 'category':
      return Boolean(d.categorySlug);
    case 'service':
      return Boolean(d.serviceSlug);
    case 'specialist':
      return Boolean(d.specialistSlug);
    case 'date':
      return Boolean(d.date);
    case 'time':
      return typeof d.time === 'number';
    case 'details':
      return Boolean(
        d.name &&
          d.name.trim().length > 1 &&
          d.phone &&
          d.whatsapp &&
          d.email &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email),
      );
    case 'notes':
      return true;
    case 'summary':
      return d.policiesAccepted === true;
    case 'payment':
      return true;
    default:
      return false;
  }
}

/** Deep-links such as /booking?category=lashes&service=volume-set skip ahead. */
function firstIncompleteStep(initial?: BookingDraft) {
  if (!initial) return 0;
  for (let i = 0; i < STEPS.length; i += 1) {
    if (!isStepComplete(STEPS[i].id, initial)) return i;
  }
  return 0;
}
