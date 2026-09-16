'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SPECIALISTS } from '@/lib/data/team';
import type { BookingDraft } from '@/lib/booking/types';
import type { ClientCategory, ClientService } from '@/lib/catalogue/shape';
import {
  bookingHasProgress,
  clearBookingSession,
  loadBookingSession,
  saveBookingSession,
} from '@/lib/booking/draftStorage';
import {
  autoDiscount,
  pickDiscount,
  type AppliedDiscount,
  type PublicOffer,
} from '@/lib/catalogue/offers';

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
  /** The live catalogue, with any price the studio has changed. */
  catalogue: ClientCategory[];
  /** Deposit percentage, as configured by the studio. */
  depositPercent: number;
  /** Automatic studio offers (no code required). */
  offers: PublicOffer[];
  resolved: {
    category?: ClientCategory;
    service?: ClientService;
    specialistName?: string;
    /** Treatment price after any validated discount. */
    total: number;
    deposit: number;
    balance: number;
  };
  /** The discount actually used for totals — automatic or a typed coupon. */
  discount: AppliedDiscount | null;
  /** Typed coupon only. Removing it falls back to any automatic offer. */
  coupon: AppliedDiscount | null;
  setCoupon: (d: AppliedDiscount | null) => void;
  /** True once the guest has started answering — used to warn before leaving. */
  hasProgress: boolean;
  /** Stop persisting and forget the saved draft (leave, or booking completed). */
  releaseDraft: () => void;
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
  catalogue,
  depositPercent = 50,
  offers = [],
}: {
  children: ReactNode;
  initial?: BookingDraft;
  catalogue: ClientCategory[];
  depositPercent?: number;
  offers?: PublicOffer[];
}) {
  const [draft, setDraft] = useState<BookingDraft>(initial ?? { specialistSlug: 'any' });
  const [step, setStep] = useState(() => firstIncompleteStep(initial));
  const [furthest, setFurthest] = useState(step);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coupon, setCoupon] = useState<AppliedDiscount | null>(null);
  const [liveOffers, setLiveOffers] = useState(offers);
  const persist = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadBookingSession();
    const restored = restoreSession(initial, stored, catalogue);
    setDraft(restored.draft);
    setStep(restored.step);
    setFurthest(restored.furthest);
    setCoupon(restored.coupon);
    persist.current = true;
    setReady(true);
  }, []);

  const releaseDraft = useCallback(() => {
    persist.current = false;
    clearBookingSession();
  }, []);

  useEffect(() => {
    if (!ready || !persist.current) return;
    saveBookingSession({ draft, step, furthest, coupon });
  }, [ready, draft, step, furthest, coupon]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/promotions/offers')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data?.offers)) return;
        setLiveOffers(data.offers);
      })
      .catch(() => {
        /* Keep whatever the server rendered. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = useCallback((patch: BookingDraft) => {
    let dropCoupon = false;
    setDraft((prev) => {
      const nextDraft = { ...prev, ...patch };
      const categoryChanged = Boolean(
        patch.categorySlug && patch.categorySlug !== prev.categorySlug,
      );
      const serviceChanged = Boolean(
        patch.serviceSlug && patch.serviceSlug !== prev.serviceSlug,
      );
      // Changing the category invalidates everything chosen beneath it.
      if (categoryChanged) {
        nextDraft.serviceSlug = undefined;
        nextDraft.specialistSlug = 'any';
        nextDraft.time = undefined;
        nextDraft.promoCode = undefined;
      }
      // A different service means a different duration, so the slot must go.
      if (serviceChanged) {
        nextDraft.time = undefined;
        // A coupon validated against one treatment must not silently carry to
        // another it may not apply to.
        nextDraft.promoCode = undefined;
      }
      if (patch.specialistSlug && patch.specialistSlug !== prev.specialistSlug) {
        nextDraft.time = undefined;
      }
      if (patch.date && patch.date !== prev.date) {
        nextDraft.time = undefined;
      }
      dropCoupon =
        categoryChanged || serviceChanged || ('promoCode' in patch && !patch.promoCode);
      return nextDraft;
    });
    if (dropCoupon) setCoupon(null);
    setErrors({});
  }, []);

  const discount = useMemo(() => {
    const categorySlug = draft.categorySlug;
    const serviceSlug = draft.serviceSlug;
    const category = categorySlug
      ? catalogue.find((c) => c.slug === categorySlug)
      : undefined;
    const service = serviceSlug
      ? category?.services.find((s) => s.slug === serviceSlug)
      : undefined;
    if (!categorySlug || !serviceSlug || !service) return null;
    return pickDiscount(
      autoDiscount(liveOffers, categorySlug, serviceSlug, service.price),
      coupon,
    );
  }, [draft.categorySlug, draft.serviceSlug, catalogue, liveOffers, coupon]);

  const resolved = useMemo(() => {
    const category = draft.categorySlug
      ? catalogue.find((c) => c.slug === draft.categorySlug)
      : undefined;
    const service = draft.serviceSlug
      ? category?.services.find((s) => s.slug === draft.serviceSlug)
      : undefined;
    const specialistName =
      !draft.specialistSlug || draft.specialistSlug === 'any'
        ? 'First available'
        : SPECIALISTS.find((s) => s.slug === draft.specialistSlug)?.name;

    const payable = service ? Math.max(0, service.price - (discount?.amount ?? 0)) : 0;
    const deposit = Math.round((payable * depositPercent) / 100);
    return {
      category,
      service,
      specialistName,
      total: payable,
      deposit,
      balance: Math.max(0, payable - deposit),
    };
  }, [draft.categorySlug, draft.serviceSlug, draft.specialistSlug, catalogue, discount, depositPercent]);

  const canAdvance = useMemo(() => isStepComplete(STEPS[step].id, draft), [step, draft]);
  const hasProgress = useMemo(() => bookingHasProgress(draft, step), [draft, step]);

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
      catalogue,
      depositPercent,
      offers: liveOffers,
      discount,
      coupon,
      setCoupon,
      hasProgress,
      releaseDraft,
    }),
    [
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
      catalogue,
      depositPercent,
      liveOffers,
      discount,
      coupon,
      hasProgress,
      releaseDraft,
    ],
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

function restoreSession(
  url: BookingDraft | undefined,
  stored: ReturnType<typeof loadBookingSession>,
  catalogue: ClientCategory[],
) {
  const urlIntent = Boolean(url?.categorySlug || url?.serviceSlug);
  const base =
    stored && !urlIntent
      ? stored.draft
      : stored && urlIntent && stored.draft.categorySlug === url?.categorySlug
        ? { ...stored.draft, ...compact(url) }
        : { specialistSlug: 'any' as const, ...compact(url) };

  const draft = sanitizeDraft(base, catalogue);
  const fallbackStep = firstIncompleteStep(draft);
  const step =
    stored && !urlIntent
      ? clampStep(stored.step)
      : stored && urlIntent && stored.draft.categorySlug === url?.categorySlug
        ? clampStep(Math.max(stored.step, fallbackStep))
        : fallbackStep;
  const furthest = Math.max(
    step,
    stored && !urlIntent ? clampStep(stored.furthest) : step,
  );
  const coupon =
    stored && stored.coupon && stored.draft.serviceSlug === draft.serviceSlug
      ? stored.coupon
      : null;

  return { draft, step, furthest, coupon };
}

function compact(draft?: BookingDraft): BookingDraft {
  if (!draft) return {};
  const next: BookingDraft = {};
  for (const [key, value] of Object.entries(draft) as Array<
    [keyof BookingDraft, BookingDraft[keyof BookingDraft]]
  >) {
    if (value !== undefined && value !== '') next[key] = value as never;
  }
  return next;
}

function sanitizeDraft(draft: BookingDraft, catalogue: ClientCategory[]): BookingDraft {
  if (catalogue.length === 0) {
    return { specialistSlug: draft.specialistSlug || 'any', ...draft };
  }
  const category = draft.categorySlug
    ? catalogue.find((c) => c.slug === draft.categorySlug)
    : undefined;
  if (!category) {
    return { specialistSlug: draft.specialistSlug || 'any' };
  }
  const service = draft.serviceSlug
    ? category.services.find((s) => s.slug === draft.serviceSlug)
    : undefined;
  return {
    ...draft,
    categorySlug: category.slug,
    serviceSlug: service?.slug,
    specialistSlug: draft.specialistSlug || 'any',
    ...(service ? {} : { time: undefined, promoCode: undefined }),
  };
}

function clampStep(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(STEPS.length - 1, Math.round(value)));
}
