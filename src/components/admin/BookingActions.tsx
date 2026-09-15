'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, Check, Loader2, Send, X } from 'lucide-react';
import type { BookingRecord, BookingStatus, DepositStatus } from '@/lib/booking/types';
import { cn } from '@/lib/utils';

type Result = { channel: string; delivered: boolean; detail?: string };

/**
 * Accept, decline and message a client.
 *
 * Confirming and declining offer to notify the client in the same step, since
 * that is what the studio almost always wants — but it is a choice, not a
 * side effect, and the outcome of each channel is reported honestly.
 */
export default function BookingActions({ booking }: { booking: BookingRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [staffNote, setStaffNote] = useState(booking.staffNote ?? '');
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/admin/bookings/' + booking.reference, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'That change did not save.');
        return;
      }
      if (Array.isArray(data.delivery) && data.delivery.length) setResults(data.delivery);
      router.refresh();
    } catch {
      setError('Network error. Nothing was changed.');
    } finally {
      setBusy(null);
    }
  }

  async function sendMessage(kind: 'confirmed' | 'reminder') {
    setBusy(kind);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/admin/bookings/' + booking.reference + '/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      setResults(data.delivery ?? null);
      if (data.error) setError(data.error);
      router.refresh();
    } catch {
      setError('Network error. Nothing was sent.');
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (status: BookingStatus) =>
    patch({ status, notify, staffNote: staffNote || undefined }, status);

  const isPending = booking.status === 'pending';

  return (
    <div className="rounded-2xl border border-line p-6">
      <p className="eyebrow mb-5">Actions</p>

      {/* Primary decisions */}
      <div className="flex flex-wrap gap-2.5">
        {isPending && (
          <>
            <ActionButton
              tone="accept"
              busy={busy === 'confirmed'}
              onClick={() => setStatus('confirmed')}
              icon={Check}
            >
              Accept booking
            </ActionButton>
            <ActionButton
              tone="decline"
              busy={busy === 'declined'}
              onClick={() => setStatus('declined')}
              icon={X}
            >
              Decline
            </ActionButton>
          </>
        )}

        {booking.status === 'confirmed' && (
          <>
            <ActionButton
              tone="accept"
              busy={busy === 'completed'}
              onClick={() => setStatus('completed')}
              icon={Check}
            >
              Mark completed
            </ActionButton>
            <ActionButton
              tone="neutral"
              busy={busy === 'no-show'}
              onClick={() => setStatus('no-show')}
            >
              No-show
            </ActionButton>
            <ActionButton
              tone="neutral"
              busy={busy === 'cancelled'}
              onClick={() => setStatus('cancelled')}
            >
              Cancel
            </ActionButton>
          </>
        )}

        {(booking.status === 'declined' ||
          booking.status === 'cancelled' ||
          booking.status === 'no-show') && (
          <ActionButton
            tone="neutral"
            busy={busy === 'pending'}
            onClick={() => setStatus('pending')}
          >
            Reopen as pending
          </ActionButton>
        )}
      </div>

      {(isPending || booking.status === 'confirmed') && (
        <label className="mt-4 flex items-start gap-3 text-sm text-ivory/60">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-champagne"
          />
          Email and WhatsApp the client about this change
        </label>
      )}

      {/* Deposit */}
      <div className="mt-7 border-t border-line pt-6">
        <p className="eyebrow mb-3">Deposit</p>
        <div className="flex flex-wrap gap-2">
          {(['paid', 'pending', 'awaiting-link', 'refunded', 'failed'] as DepositStatus[]).map(
            (d) => (
              <button
                key={d}
                type="button"
                disabled={busy !== null || booking.depositStatus === d}
                onClick={() => patch({ depositStatus: d }, 'dep-' + d)}
                className={cn(
                  'rounded-full border px-4 py-2 font-sans text-2xs uppercase tracking-luxe transition-colors duration-300 disabled:cursor-default',
                  booking.depositStatus === d
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-line text-ivory/50 hover:border-line-3 hover:text-ivory',
                )}
              >
                {busy === 'dep-' + d ? '…' : d.replace('-', ' ')}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Messaging */}
      <div className="mt-7 border-t border-line pt-6">
        <p className="eyebrow mb-3">Send the client a message</p>
        <div className="flex flex-wrap gap-2.5">
          <ActionButton
            tone="neutral"
            busy={busy === 'confirmed'}
            onClick={() => sendMessage('confirmed')}
            icon={Send}
          >
            {booking.confirmationSentAt ? 'Resend confirmation' : 'Send confirmation'}
          </ActionButton>
          <ActionButton
            tone="neutral"
            busy={busy === 'reminder'}
            onClick={() => sendMessage('reminder')}
            icon={BellRing}
          >
            {booking.reminderSentAt ? 'Resend reminder' : 'Send reminder'}
          </ActionButton>
        </div>
      </div>

      {/* Studio note */}
      <div className="mt-7 border-t border-line pt-6">
        <label htmlFor="staff-note" className="eyebrow mb-3 block">
          Studio note
        </label>
        <textarea
          id="staff-note"
          rows={3}
          value={staffNote}
          maxLength={1000}
          onChange={(e) => setStaffNote(e.target.value)}
          placeholder="Anything the team should know. Only ever visible here."
          className="w-full resize-none rounded-xl border border-line bg-fill px-4 py-3 text-sm leading-relaxed text-ivory placeholder:text-ivory/30 transition-colors focus:border-accent/60 focus:outline-none"
        />
        <button
          type="button"
          disabled={busy !== null || staffNote === (booking.staffNote ?? '')}
          onClick={() => patch({ staffNote }, 'note')}
          className="mt-3 rounded-full border border-line-2 px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/60 transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-30"
        >
          {busy === 'note' ? 'Saving…' : 'Save note'}
        </button>
      </div>

      {/* Outcome */}
      {(results || error) && (
        <div role="status" aria-live="polite" className="mt-6 border-t border-line pt-5">
          {error && <p className="text-sm text-danger">{error}</p>}
          {results?.map((r) => (
            <p
              key={r.channel}
              className={'text-sm ' + (r.delivered ? 'text-success' : 'text-warn')}
            >
              {r.channel}: {r.delivered ? 'delivered' : 'not sent'}
              {r.detail && !r.delivered ? ' — ' + r.detail : ''}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  busy,
  tone,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
  tone: 'accept' | 'decline' | 'neutral';
  icon?: typeof Check;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe transition-colors duration-300 disabled:opacity-50',
        tone === 'accept' && 'bg-champagne text-onaccent hover:bg-champagne-light',
        tone === 'decline' && 'border border-danger/50 text-danger hover:bg-danger/10',
        tone === 'neutral' && 'border border-line-2 text-ivory/65 hover:border-accent/60 hover:text-accent',
      )}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
