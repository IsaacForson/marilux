'use client';

import { Check, Pencil } from 'lucide-react';
import { BOOKING_POLICIES } from '@/lib/data/policies';
import { formatDuration, formatPrice } from '@/lib/data/services';
import { formatTime, GHS } from '@/lib/utils';
import { useBooking } from '../BookingContext';
import Accordion from '@/components/ui/Accordion';

export default function StepSummary() {
  const { draft, set, goTo, resolved, errors } = useBooking();
  const { service, category } = resolved;

  const rows: Array<{ label: string; value: string; step: number }> = [
    { label: 'Category', value: category?.name ?? '—', step: 0 },
    { label: 'Treatment', value: service?.name ?? '—', step: 1 },
    { label: 'Specialist', value: resolved.specialistName ?? '—', step: 2 },
    { label: 'Date', value: formatLongDate(draft.date), step: 3 },
    { label: 'Time', value: typeof draft.time === 'number' ? formatTime(draft.time) : '—', step: 4 },
    { label: 'Duration', value: service ? formatDuration(service.duration) : '—', step: 1 },
    { label: 'Name', value: draft.name ?? '—', step: 5 },
    { label: 'Phone', value: draft.phone ?? '—', step: 5 },
    { label: 'WhatsApp', value: draft.whatsapp ?? '—', step: 5 },
    { label: 'Email', value: draft.email ?? '—', step: 5 },
    { label: 'Notes', value: draft.notes?.trim() || 'None', step: 6 },
  ];

  return (
    <div>
      <dl className="overflow-hidden rounded-2xl border border-white/[0.09]">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={
              'group flex items-start justify-between gap-4 px-5 py-4 sm:px-6 ' +
              (i % 2 ? 'bg-white/[0.012]' : '')
            }
          >
            <dt className="w-28 shrink-0 pt-0.5 font-sans text-2xs uppercase tracking-luxe text-ivory/35 sm:w-36">
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 break-words text-[0.95rem] text-ivory/85">
              {row.value}
            </dd>
            <button
              type="button"
              onClick={() => goTo(row.step)}
              className="shrink-0 rounded-lg p-2 text-ivory/30 opacity-0 transition-all duration-400 focus-visible:opacity-100 group-hover:opacity-100 hover:text-champagne"
              aria-label={'Edit ' + row.label.toLowerCase()}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        ))}
      </dl>

      {/* Money */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-champagne/25 bg-champagne/[0.05]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/50">
            Treatment total
          </span>
          <span className="font-display text-xl text-ivory">
            {service ? formatPrice(service) : '—'}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-champagne/20 px-5 py-4 sm:px-6">
          <span className="font-sans text-2xs uppercase tracking-luxe text-champagne">
            Deposit due now (50%)
          </span>
          <span className="font-display text-2xl text-champagne">{GHS(resolved.deposit)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-champagne/20 px-5 py-4 sm:px-6">
          <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/40">
            Balance, in studio
          </span>
          <span className="font-display text-lg text-ivory/70">
            {GHS((service?.price ?? 0) - resolved.deposit)}
          </span>
        </div>
      </div>

      {/* Policy */}
      <div id="policy" className="mt-12 scroll-mt-32">
        <p className="eyebrow mb-5">Booking policy</p>
        <Accordion
          items={BOOKING_POLICIES.map((p) => ({
            id: p.id,
            title: p.title,
            meta: p.summary,
            body: p.detail,
          }))}
          defaultOpen="deposit"
        />
      </div>

      <label
        className={
          'mt-8 flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-colors duration-500 sm:p-6 ' +
          (draft.policiesAccepted
            ? 'border-champagne/60 bg-champagne/[0.06]'
            : errors.policiesAccepted
              ? 'border-rosegold/60 bg-rosegold/[0.04]'
              : 'border-white/[0.09] hover:border-white/20')
        }
      >
        <input
          type="checkbox"
          checked={Boolean(draft.policiesAccepted)}
          onChange={(e) => set({ policiesAccepted: e.target.checked })}
          aria-describedby="policy-ack"
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={
            'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-all duration-400 ' +
            (draft.policiesAccepted
              ? 'border-champagne bg-champagne text-ink'
              : 'border-white/25 text-transparent')
          }
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <span id="policy-ack" className="text-sm leading-relaxed text-ivory/65">
          I have read and accept the booking policy. I understand the{' '}
          <strong className="font-medium text-ivory">50% deposit is non-refundable</strong>, that{' '}
          <strong className="font-medium text-ivory">24 hours notice</strong> is required to
          cancel or reschedule, and that I should disclose any allergies, pregnancy, skin
          sensitivities, medical conditions or recent cosmetic procedures.
        </span>
      </label>

      {errors.policiesAccepted && (
        <p role="alert" className="mt-3 text-xs text-rosegold-light">
          {errors.policiesAccepted}
        </p>
      )}
    </div>
  );
}

/** Parses the ISO date in local time — `new Date(iso)` would shift by timezone. */
function formatLongDate(iso: string | undefined) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}
