import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageSquare, Phone } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { bookings, statusCount } from '@/lib/store/bookings';
import { formatDuration } from '@/lib/data/services';
import { whatsappLink } from '@/lib/data/site';
import { formatTime, GHS } from '@/lib/utils';
import { BOOKING_POLICIES } from '@/lib/data/policies';
import AdminNav from '@/components/admin/AdminNav';
import { DepositPill, StatusPill } from '@/components/admin/StatusPill';
import BookingActions from '@/components/admin/BookingActions';

export const dynamic = 'force-dynamic';

export default async function AdminBookingDetail({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  await requireAdmin();
  const { reference } = await params;

  const booking = await bookings.find(reference);
  if (!booking) notFound();

  const all = await bookings.all();
  const pending = statusCount(all, 'pending');

  // Everything else this client has ever booked — useful context before a call.
  const history = all.filter(
    (b) => b.reference !== booking.reference && b.email === booking.email,
  );

  const preparation = BOOKING_POLICIES.find((p) => p.id === 'preparation');

  return (
    <>
      <AdminNav pending={pending} />

      <main className="mx-auto max-w-5xl px-[var(--edge)] py-10">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          All bookings
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">{booking.reference}</p>
            <h1 className="display-md">{booking.name}</h1>
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill status={booking.status} />
              <DepositPill status={booking.depositStatus} />
            </p>
          </div>

          <div className="text-right">
            <p className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-light leading-none text-accent">
              {GHS(booking.price)}
            </p>
            <p className="mt-2 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
              {GHS(booking.deposit)} deposit · {GHS(booking.price - booking.deposit)} on the day
            </p>
          </div>
        </div>

        {/* What to prepare */}
        <section className="mt-9 rounded-2xl border border-accent/25 bg-accent/[0.05] p-6">
          <p className="eyebrow mb-4">The appointment</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Date" value={longDate(booking.date)} />
            <Detail label="Time" value={formatTime(booking.time)} />
            <Detail label="Duration" value={formatDuration(booking.duration)} />
            <Detail label="Specialist" value={booking.specialistName} />
            <Detail label="Treatment" value={booking.serviceName} className="sm:col-span-2" />
            <Detail label="Category" value={booking.categoryName} className="sm:col-span-2" />
          </div>
        </section>

        {/* Client notes — the thing the studio needs before they prepare */}
        <section className="mt-4 rounded-2xl border border-line bg-fill p-6">
          <p className="eyebrow mb-3">Client notes</p>
          {booking.notes?.trim() ? (
            <p className="whitespace-pre-wrap leading-relaxed text-ivory/80">
              {booking.notes.trim()}
            </p>
          ) : (
            <p className="text-sm text-ivory/35">
              The client did not leave any notes. Worth asking about allergies, pregnancy, skin
              sensitivities and recent procedures when you call.
            </p>
          )}

          {preparation && (
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ivory/40">
              <span className="text-ivory/60">Reminder — </span>
              {preparation.summary}
            </p>
          )}
        </section>

        {/* Contact */}
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <ContactCard
            icon={Phone}
            label="Phone"
            value={booking.phone}
            href={'tel:' + booking.phone.replace(/\s/g, '')}
          />
          <ContactCard
            icon={MessageSquare}
            label="WhatsApp"
            value={booking.whatsapp}
            href={whatsappLink(
              'Hello ' +
                booking.name.split(' ')[0] +
                ', this is Marilux Beauty Bar about your booking ' +
                booking.reference +
                '.',
            )}
            external
          />
          <ContactCard
            icon={Mail}
            label="Email"
            value={booking.email}
            href={'mailto:' + booking.email}
          />
        </section>

        {/* Actions */}
        <section className="mt-8">
          <BookingActions booking={booking} />
        </section>

        {/* Trail */}
        <section className="mt-8 rounded-2xl border border-line p-6">
          <p className="eyebrow mb-4">Record</p>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Received" value={stamp(booking.createdAt)} />
            <Detail label="Last updated" value={stamp(booking.updatedAt)} />
            <Detail
              label="Confirmation sent"
              value={booking.confirmationSentAt ? stamp(booking.confirmationSentAt) : 'Not sent'}
            />
            <Detail
              label="Reminder sent"
              value={booking.reminderSentAt ? stamp(booking.reminderSentAt) : 'Not sent'}
            />
          </dl>
          {booking.staffNote && (
            <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-ivory/60">
              <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                Studio note —{' '}
              </span>
              {booking.staffNote}
            </p>
          )}
        </section>

        {/* History */}
        {history.length > 0 && (
          <section className="mt-8">
            <p className="eyebrow mb-4">
              {history.length} previous booking{history.length === 1 ? '' : 's'} from this client
            </p>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {history.map((h) => (
                <li key={h.reference}>
                  <Link
                    href={'/admin/bookings/' + h.reference}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-fill"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ivory/80">{h.serviceName}</span>
                      <span className="block text-xs text-ivory/40">
                        {longDate(h.date)} · {formatTime(h.time)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-display text-ivory/70">{GHS(h.price)}</span>
                      <StatusPill status={h.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}

function Detail({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">{label}</dt>
      <dd className="mt-1.5 break-words text-ivory/90">{value}</dd>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group rounded-2xl border border-line bg-fill p-5 transition-colors hover:border-accent/40"
    >
      <span className="flex items-center gap-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/35">
        <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} aria-hidden="true" />
        {label}
      </span>
      <span className="mt-2.5 block break-all text-ivory transition-colors group-hover:text-accent">
        {value}
      </span>
    </a>
  );
}

function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}

function stamp(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
