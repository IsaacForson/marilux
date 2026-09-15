import Link from 'next/link';
import { ArrowRight, BellRing, CalendarClock, Mail, MessageSquare } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { bookings, statusCount, summarise } from '@/lib/store/bookings';
import { ACTIVE_STATUSES } from '@/lib/booking/types';
import { formatTime, GHS, toISODate } from '@/lib/utils';
import { formatDuration } from '@/lib/data/services';
import { smtpConfigured } from '@/lib/integrations/smtp';
import AdminNav from '@/components/admin/AdminNav';
import StatCard from '@/components/admin/StatCard';
import { DepositPill, StatusPill } from '@/components/admin/StatusPill';
import SendRemindersButton from '@/components/admin/SendRemindersButton';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  await requireAdmin();

  const all = await bookings.all();
  const earnings = summarise(all);
  const pending = statusCount(all, 'pending');

  const today = toISODate(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toISODate(tomorrowDate);

  const todays = all
    .filter((b) => b.date === today && ACTIVE_STATUSES.includes(b.status))
    .sort((a, b) => a.time - b.time);

  const tomorrows = all.filter(
    (b) => b.date === tomorrow && b.status === 'confirmed',
  );
  const remindersDue = tomorrows.filter((b) => !b.reminderSentAt).length;

  const awaiting = all.filter((b) => b.status === 'pending').slice(0, 5);

  const emailReady = smtpConfigured() || Boolean(process.env.GOOGLE_REFRESH_TOKEN);
  const whatsappReady = Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );

  return (
    <>
      <AdminNav pending={pending} />

      <main className="mx-auto max-w-7xl px-[var(--edge)] py-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-3">Studio overview</p>
            <h1 className="display-md">
              {greeting()}, <span className="gold-text">Marilux</span>.
            </h1>
            <p className="mt-3 text-sm text-ivory/45">
              {todays.length === 0
                ? 'Nothing in the diary today.'
                : todays.length +
                  (todays.length === 1 ? ' appointment' : ' appointments') +
                  ' today.'}
              {pending > 0 && ' · ' + pending + ' awaiting your review.'}
            </p>
          </div>

          <SendRemindersButton due={remindersDue} />
        </div>

        {/* Earnings */}
        <section className="mt-10" aria-labelledby="earnings-title">
          <h2 id="earnings-title" className="eyebrow mb-4">
            Earnings
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Deposits collected"
              value={GHS(earnings.depositsCollected)}
              hint="Paid deposits across all bookings"
              accent
            />
            <StatCard
              label="Revenue completed"
              value={GHS(earnings.revenueCompleted)}
              hint={earnings.appointments + ' appointments delivered'}
            />
            <StatCard
              label="Booked, not yet delivered"
              value={GHS(earnings.revenueBooked)}
              hint="Confirmed appointments still to come"
            />
            <StatCard
              label="Balance due in studio"
              value={GHS(earnings.balanceOutstanding)}
              hint="Remaining 50% on confirmed bookings"
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Average appointment"
              value={earnings.appointments ? GHS(earnings.averageValue) : '—'}
            />
            <StatCard label="Deposits forfeited" value={GHS(earnings.forfeited)} hint="No-shows" />
            <StatCard label="Total bookings" value={String(all.length)} />
          </div>
        </section>

        {/* Today */}
        <section className="mt-12" aria-labelledby="today-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="today-title" className="eyebrow">
              Today — {longDate(today)}
            </h2>
            <Link
              href="/admin/schedule"
              className="inline-flex items-center gap-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-accent"
            >
              Full schedule
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>

          {todays.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="A clear day."
              body="No appointments are booked for today."
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {todays.map((b) => (
                <li key={b.reference}>
                  <Link
                    href={'/admin/bookings/' + b.reference}
                    className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors hover:bg-fill"
                  >
                    <span className="w-20 shrink-0 font-display text-lg tabular-nums text-accent">
                      {formatTime(b.time)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-ivory">{b.name}</span>
                      <span className="block truncate text-sm text-ivory/45">
                        {b.serviceName} · {formatDuration(b.duration)} · {b.specialistName}
                      </span>
                    </span>
                    <StatusPill status={b.status} />
                    <DepositPill status={b.depositStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Awaiting review */}
        <section className="mt-12" aria-labelledby="pending-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="pending-title" className="eyebrow">
              Awaiting your review
            </h2>
            {pending > 5 && (
              <Link
                href="/admin/bookings?status=pending"
                className="inline-flex items-center gap-1.5 font-sans text-2xs uppercase tracking-luxe text-ivory/45 transition-colors hover:text-accent"
              >
                All {pending}
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </Link>
            )}
          </div>

          {awaiting.length === 0 ? (
            <EmptyState
              icon={BellRing}
              title="Nothing waiting."
              body="Every booking request has been reviewed."
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {awaiting.map((b) => (
                <li key={b.reference}>
                  <Link
                    href={'/admin/bookings/' + b.reference}
                    className="block rounded-2xl border border-warn/30 bg-warn/[0.05] p-5 transition-colors hover:border-warn/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg text-ivory">{b.name}</p>
                        <p className="mt-1 truncate text-sm text-ivory/50">{b.serviceName}</p>
                      </div>
                      <span className="shrink-0 text-right">
                        <span className="block font-display text-lg text-accent">
                          {GHS(b.price)}
                        </span>
                        <span className="mt-0.5 block font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                          {GHS(b.deposit)} deposit
                        </span>
                      </span>
                    </div>
                    <p className="mt-3 font-sans text-2xs uppercase tracking-luxe text-ivory/40">
                      {longDate(b.date)} · {formatTime(b.time)} · {b.specialistName}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Channel health */}
        <section className="mt-12" aria-labelledby="channels-title">
          <h2 id="channels-title" className="eyebrow mb-4">
            Notification channels
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ChannelRow
              icon={Mail}
              label="Email"
              ready={emailReady}
              readyHint="Confirmations and reminders will send."
              downHint="Set SMTP_HOST / SMTP_USER / SMTP_PASSWORD, or the Gmail API variables."
            />
            <ChannelRow
              icon={MessageSquare}
              label="WhatsApp"
              ready={whatsappReady}
              readyHint="Messages will send through the Cloud API."
              downHint="Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID."
            />
          </div>
        </section>
      </main>
    </>
  );
}

function ChannelRow({
  icon: Icon,
  label,
  ready,
  readyHint,
  downHint,
}: {
  icon: typeof Mail;
  label: string;
  ready: boolean;
  readyHint: string;
  downHint: string;
}) {
  return (
    <div
      className={
        'flex items-start gap-4 rounded-2xl border p-5 ' +
        (ready ? 'border-success/30 bg-success/[0.05]' : 'border-warn/30 bg-warn/[0.05]')
      }
    >
      <Icon
        className={'mt-0.5 h-4 w-4 shrink-0 ' + (ready ? 'text-success' : 'text-warn')}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div>
        <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/70">
          {label} — {ready ? 'connected' : 'not configured'}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ivory/45">
          {ready ? readyHint : downHint}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BellRing;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-fill px-6 py-12 text-center">
      <Icon className="mx-auto h-6 w-6 text-ivory/25" strokeWidth={1.3} aria-hidden="true" />
      <p className="mt-4 font-display text-xl font-light text-ivory">{title}</p>
      <p className="mt-2 text-sm text-ivory/40">{body}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function longDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(y, m - 1, d));
}
