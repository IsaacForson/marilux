'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  BannerSettings,
  BookingSettings,
  NotificationSettings,
} from '@/lib/settings/types';
import { ListInput, Panel, Select, TextArea, TextInput, Toggle } from './Form';
import SaveBar from './SaveBar';

type Groups = {
  notifications: NotificationSettings;
  booking: BookingSettings;
  banner: BannerSettings;
};

export default function SettingsEditor({ initial }: { initial: Groups }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Groups>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial],
  );

  const patch = <K extends keyof Groups>(key: K, value: Partial<Groups[K]>) => {
    setDraft((d) => ({ ...d, [key]: { ...d[key], ...value } }));
    setMessage(null);
    setError(null);
  };

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      for (const key of ['notifications', 'booking', 'banner'] as const) {
        if (JSON.stringify(draft[key]) === JSON.stringify(initial[key])) continue;
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: draft[key] }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save.');
      }
      setMessage('Saved. The website is updated.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  const n = draft.notifications;

  return (
    <div className="space-y-4">
      <Panel
        title="Where bookings reach you"
        description="Change these any time you change number or address — no developer needed. Every new booking is sent to all of the addresses and numbers listed here."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ListInput
            label="Email addresses"
            hint="The first is primary. Add a manager's address to copy them in."
            type="email"
            placeholder="you@example.com"
            values={n.ownerEmails}
            onChange={(ownerEmails) => patch('notifications', { ownerEmails })}
          />
          <ListInput
            label="Phone numbers for SMS"
            hint="Ghanaian format. 0545489200 or +233545489200 both work."
            type="tel"
            placeholder="0545489200"
            values={n.ownerPhones}
            onChange={(ownerPhones) => patch('notifications', { ownerPhones })}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TextInput
            label="WhatsApp number"
            hint="Used only when WhatsApp is switched on."
            type="tel"
            value={n.ownerWhatsapp}
            onChange={(e) => patch('notifications', { ownerWhatsapp: e.target.value })}
          />
          <TextInput
            label="Send emails from"
            hint="Must be verified with your email provider, or messages are rejected."
            type="email"
            value={n.fromEmail}
            onChange={(e) => patch('notifications', { fromEmail: e.target.value })}
          />
        </div>

        <div className="mt-6">
          <TextInput
            label="SMS sender name"
            hint="What clients see instead of a number. Must be registered with your SMS provider."
            value={n.smsSenderId}
            maxLength={11}
            onChange={(e) => patch('notifications', { smsSenderId: e.target.value })}
          />
        </div>
      </Panel>

      <Panel
        title="Which channels are on"
        description="Switch a channel off without deleting its credentials — useful if you run out of SMS credit and want the emails to keep going."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Toggle
            label="Email"
            hint="Booking alerts to you, confirmations to clients."
            checked={n.emailEnabled}
            onChange={(emailEnabled) => patch('notifications', { emailEnabled })}
          />
          <Toggle
            label="SMS"
            hint="Texts to you and to clients."
            checked={n.smsEnabled}
            onChange={(smsEnabled) => patch('notifications', { smsEnabled })}
          />
          <Toggle
            label="WhatsApp"
            hint="Only sends when credentials are configured."
            checked={n.whatsappEnabled}
            onChange={(whatsappEnabled) => patch('notifications', { whatsappEnabled })}
          />
          <Toggle
            label="Email the client"
            hint="Confirmations and reminders by email."
            checked={n.notifyClientEmail}
            onChange={(notifyClientEmail) => patch('notifications', { notifyClientEmail })}
          />
          <Toggle
            label="Text the client"
            hint="The same message by SMS, so nothing is missed."
            checked={n.notifyClientSms}
            onChange={(notifyClientSms) => patch('notifications', { notifyClientSms })}
          />
        </div>
      </Panel>

      <Panel
        title="Booking rules"
        description="How the booking flow behaves for clients."
      >
        <div className="grid gap-6 sm:grid-cols-3">
          <TextInput
            label="Deposit percentage"
            hint="Taken at checkout. The rest is paid in studio."
            type="number"
            min={0}
            max={100}
            value={draft.booking.depositPercent}
            onChange={(e) =>
              patch('booking', { depositPercent: Number(e.target.value) || 0 })
            }
          />
          <TextInput
            label="Minimum notice (hours)"
            hint="How far ahead same-day booking closes."
            type="number"
            min={0}
            max={72}
            value={draft.booking.minNoticeHours}
            onChange={(e) =>
              patch('booking', { minNoticeHours: Number(e.target.value) || 0 })
            }
          />
          <TextInput
            label="Book ahead (days)"
            hint="How far the calendar opens."
            type="number"
            min={1}
            max={365}
            value={draft.booking.maxAdvanceDays}
            onChange={(e) =>
              patch('booking', { maxAdvanceDays: Number(e.target.value) || 1 })
            }
          />
        </div>

        <div className="mt-6">
          <TextArea
            label="Note at checkout"
            hint="Optional. Shown above the booking policy — good for holiday hours or a temporary change."
            rows={3}
            value={draft.booking.policyNote}
            onChange={(e) => patch('booking', { policyNote: e.target.value })}
          />
        </div>

        <div className="mt-6 space-y-3">
          <Toggle
            label="Online booking is open"
            hint="Switch off to pause new bookings without taking the site down."
            checked={draft.booking.bookingOpen}
            onChange={(bookingOpen) => patch('booking', { bookingOpen })}
          />
          {!draft.booking.bookingOpen && (
            <TextArea
              label="Message shown while closed"
              rows={2}
              value={draft.booking.closedMessage}
              onChange={(e) => patch('booking', { closedMessage: e.target.value })}
            />
          )}
        </div>
      </Panel>

      <Panel
        title="Announcement banner"
        description="A strip across the top of the website. Use it for a promotion, a holiday closure, or a new treatment."
      >
        <Toggle
          label="Show the banner"
          checked={draft.banner.enabled}
          onChange={(enabled) => patch('banner', { enabled })}
        />

        {draft.banner.enabled && (
          <div className="mt-5 grid gap-6">
            <TextInput
              label="Message"
              placeholder="20% off all facials this month"
              value={draft.banner.message}
              onChange={(e) => patch('banner', { message: e.target.value })}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextInput
                label="Button text"
                placeholder="Book now"
                value={draft.banner.linkLabel}
                onChange={(e) => patch('banner', { linkLabel: e.target.value })}
              />
              <Select
                label="Button goes to"
                value={draft.banner.linkHref}
                onChange={(e) => patch('banner', { linkHref: e.target.value })}
              >
                <option value="/booking">Booking page</option>
                <option value="/services">Services</option>
                <option value="/gallery">Gallery</option>
                <option value="/institute">Institute</option>
                <option value="/contact">Contact</option>
              </Select>
            </div>
          </div>
        )}
      </Panel>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => {
          setDraft(initial);
          setMessage(null);
          setError(null);
        }}
        message={message}
        error={error}
      />
    </div>
  );
}
