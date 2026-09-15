import Link from 'next/link';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { bookings, statusCount } from '@/lib/store/bookings';
import { ACTIVE_STATUSES, type BookingRecord } from '@/lib/booking/types';
import { SITE } from '@/lib/data/site';
import { formatDuration } from '@/lib/data/services';
import { formatTime, GHS, toISODate } from '@/lib/utils';
import AdminNav from '@/components/admin/AdminNav';
import { DepositPill, StatusPill } from '@/components/admin/StatusPill';

export const dynamic = 'force-dynamic';

/** Seven days at a time, starting from the given date. */
const SPAN = 7;

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await requireAdmin();
  const { from } = await searchParams;

  const all = await bookings.all();
  const pending = statusCount(all, 'pending');

  const start = parseISO(from) ?? startOfToday();
  const days = Array.from({ length: SPAN }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prev = new Date(start);
  prev.setDate(prev.getDate() - SPAN);
  const next = new Date(start);
  next.setDate(next.getDate() + SPAN);

  const inWindow = all.filter(
    (b) => days.some((d) => toISODate(d) === b.date) && ACTIVE_STATUSES.includes(b.status),
  );

  const totalValue = inWindow.reduce((sum, b) => sum + b.price, 0);
  const totalMinutes = inWindow.reduce((sum, b) => sum + b.duration, 0);

  return (
    <>
      <AdminNav pending={pending} />

      <main className="mx-auto max-w-7xl px-[var(--edge)] py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">Schedule</p>
            <h1 className="display-md">The week ahead.</h1>
            <p className="mt-3 text-sm text-ivory/45">
              {inWindow.length} appointment{inWindow.length === 1 ? '' : 's'} ·{' '}
              {formatDuration(totalMinutes || 0)} of chair time · {GHS(totalValue)} booked
            </p>
          </div>

          <nav aria-label="Change week" className="flex items-center gap-2">
            <Link
              href={'/admin/schedule?from=' + toISODate(prev)}
              aria-label="Previous week"
              className="grid h-11 w-11 place-items-center rounded-full border border-line-2 text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <Link
              href="/admin/schedule"
              className="rounded-full border border-line-2 px-5 py-3 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent"
            >
              This week
            </Link>
            <Link
              href={'/admin/schedule?from=' + toISODate(next)}
              aria-label="Next week"
              className="grid h-11 w-11 place-items-center rounded-full border border-line-2 text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <div className="mt-9 space-y-4">
          {days.map((day) => {
            const iso = toISODate(day);
            const dayBookings = inWindow
              .filter((b) => b.date === iso)
              .sort((a, b) => a.time - b.time);
            const hours = SITE.openingHours[day.getDay()];
            const isToday = iso === toISODate(new Date());

            return (
              <section
                key={iso}
                aria-labelledby={'day-' + iso}
                className={
                  'overflow-hidden rounded-2xl border ' +
                  (isToday ? 'border-accent/40' : 'border-line')
                }
              >
                <header
                  className={
                    'flex flex-wrap items-baseline justify-between gap-3 px-5 py-3.5 ' +
                    (isToday ? 'bg-accent/[0.07]' : 'bg-fill')
                  }
                >
                  <h2
                    id={'day-' + iso}
                    className={
                      'font-display text-lg font-light ' +
                      (isToday ? 'text-accent' : 'text-ivory')
                    }
                  >
                    {dayLabel(day)}
                    {isToday && (
                      <span className="ml-3 font-sans text-2xs uppercase tracking-luxe text-accent">
                        Today
                      </span>
                    )}
                  </h2>
                  <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                    {hours ? hours.open + ':00 – ' + hours.close + ':00' : 'Closed'}
                    {dayBookings.length > 0 &&
                      ' · ' + dayBookings.length + ' booked'}
                  </p>
                </header>

                {dayBookings.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-ivory/30">No appointments.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {dayBookings.map((b) => (
                      <li key={b.reference}>
                        <BookingRow booking={b} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {inWindow.length === 0 && (
          <div className="mt-8 rounded-2xl border border-line bg-fill px-6 py-12 text-center">
            <CalendarDays
              className="mx-auto h-6 w-6 text-ivory/25"
              strokeWidth={1.3}
              aria-hidden="true"
            />
            <p className="mt-4 font-display text-xl font-light text-ivory">
              Nothing booked this week.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

function BookingRow({ booking: b }: { booking: BookingRecord }) {
  return (
    <Link
      href={'/admin/bookings/' + b.reference}
      className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-fill"
    >
      <span className="w-24 shrink-0">
        <span className="block font-display text-lg tabular-nums text-accent">
          {formatTime(b.time)}
        </span>
        <span className="block text-xs text-ivory/35">{formatDuration(b.duration)}</span>
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-ivory">{b.name}</span>
        <span className="block truncate text-sm text-ivory/45">
          {b.serviceName} · {b.specialistName}
        </span>
        {b.notes?.trim() && (
          <span className="mt-1 block truncate text-xs text-warn/80">
            Note: {b.notes.trim()}
          </span>
        )}
      </span>

      <span className="flex flex-wrap items-center gap-2">
        <span className="font-display text-ivory/70">{GHS(b.price)}</span>
        <StatusPill status={b.status} />
        <DepositPill status={b.depositStatus} />
      </span>
    </Link>
  );
}

function parseISO(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}
