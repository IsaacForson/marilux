import { requireAdmin } from '@/lib/admin/auth';
import { getAllSettings } from '@/lib/settings/store';
import { bookings, statusCount } from '@/lib/store/bookings';
import { usingDatabase } from '@/lib/store/bookings';
import AdminNav from '@/components/admin/AdminNav';
import SettingsEditor from '@/components/admin/SettingsEditor';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();

  const [{ notifications, booking, banner }, all] = await Promise.all([
    getAllSettings(),
    bookings.all(),
  ]);

  return (
    <>
      <AdminNav pending={statusCount(all, 'pending')} />

      <main className="mx-auto max-w-5xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Settings</p>
        <h1 className="display-md">How the studio runs.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          Everything here is saved to your database and takes effect on the website immediately.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so settings cannot be saved. Set{' '}
            <code className="text-accent">DATABASE_URL</code> and restart.
          </p>
        )}

        <div className="mt-9">
          <SettingsEditor initial={{ notifications, booking, banner }} />
        </div>
      </main>
    </>
  );
}
