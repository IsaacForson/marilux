import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { bookings, statusCount } from '@/lib/store/bookings';
import { BOOKING_STATUSES, STATUS_LABEL, type BookingStatus } from '@/lib/booking/types';
import { formatTime, GHS } from '@/lib/utils';
import { formatDuration } from '@/lib/data/services';
import AdminNav from '@/components/admin/AdminNav';
import { DepositPill, StatusPill } from '@/components/admin/StatusPill';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const { status, q } = await searchParams;

  const all = await bookings.all();
  const pending = statusCount(all, 'pending');

  const query = (q ?? '').trim().toLowerCase();
  const filtered = all.filter((b) => {
    if (status && status !== 'all' && b.status !== status) return false;
    if (!query) return true;
    return [b.name, b.reference, b.email, b.phone, b.serviceName, b.specialistName]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  const tabs: Array<{ slug: string; label: string; count: number }> = [
    { slug: 'all', label: 'All', count: all.length },
    ...BOOKING_STATUSES.map((s) => ({
      slug: s,
      label: STATUS_LABEL[s],
      count: statusCount(all, s),
    })),
  ];

  const current = status ?? 'all';

  return (
    <>
      <AdminNav pending={pending} />

      <main className="mx-auto max-w-7xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Bookings</p>
        <h1 className="display-md">Every appointment.</h1>
        <p className="mt-3 text-sm text-ivory/45">
          Full client details, notes and deposit status. Select any booking to accept, decline or
          message the client.
        </p>

        {/* Search */}
        <form className="mt-8 flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="q" className="sr-only">
            Search bookings
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ''}
            placeholder="Search name, reference, email, phone or service"
            className="w-full rounded-xl border border-line bg-fill px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-line-2 px-5 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent"
          >
            Search
          </button>
        </form>

        {/* Status tabs */}
        <nav aria-label="Filter by status" className="mt-5">
          <ul className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <li key={t.slug}>
                <Link
                  href={
                    '/admin/bookings?status=' + t.slug + (q ? '&q=' + encodeURIComponent(q) : '')
                  }
                  aria-current={current === t.slug ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 font-sans text-2xs uppercase tracking-luxe transition-colors duration-300',
                    current === t.slug
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-line text-ivory/45 hover:border-line-3 hover:text-ivory',
                  )}
                >
                  {t.label}
                  <span className="text-ivory/30">{t.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Results */}
        <p aria-live="polite" className="sr-only">
          {filtered.length} bookings shown
        </p>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-line bg-fill px-6 py-16 text-center">
            <Inbox className="mx-auto h-6 w-6 text-ivory/25" strokeWidth={1.3} aria-hidden="true" />
            <p className="mt-4 font-display text-xl font-light text-ivory">
              {all.length === 0 ? 'No bookings yet.' : 'Nothing matches that.'}
            </p>
            <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ivory/40">
              {all.length === 0
                ? 'New bookings from the website will appear here the moment they are submitted.'
                : 'Try a different status or search term.'}
            </p>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {filtered.map((b) => (
              <li key={b.reference}>
                <Link
                  href={'/admin/bookings/' + b.reference}
                  className="grid gap-x-5 gap-y-2.5 px-5 py-4 transition-colors hover:bg-fill lg:grid-cols-[1.4fr,1.4fr,1fr,auto] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-ivory">{b.name}</p>
                    <p className="truncate font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                      {b.reference}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm text-ivory/75">{b.serviceName}</p>
                    <p className="truncate text-xs text-ivory/40">
                      {b.specialistName} · {formatDuration(b.duration)}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm text-ivory/75">{shortDate(b.date)}</p>
                    <p className="text-xs tabular-nums text-ivory/40">{formatTime(b.time)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <span className="mr-1 font-display text-lg text-accent">{GHS(b.price)}</span>
                    <StatusPill status={b.status as BookingStatus} />
                    <DepositPill status={b.depositStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

function shortDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}
