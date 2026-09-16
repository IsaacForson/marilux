import { requireAdmin } from '@/lib/admin/auth';
import { listUsers } from '@/lib/admin/users';
import { bookings, statusCount, usingDatabase } from '@/lib/store/bookings';
import { emailAdapter } from '@/lib/integrations/email';
import AdminNav from '@/components/admin/AdminNav';
import TeamEditor from '@/components/admin/TeamEditor';
import ChangePassword from '@/components/admin/ChangePassword';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const session = await requireAdmin();
  const [users, all] = await Promise.all([listUsers(), bookings.all()]);

  return (
    <>
      <AdminNav pending={statusCount(all, 'pending')} />

      <main className="mx-auto max-w-4xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Accounts</p>
        <h1 className="display-md">Who can sign in.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          Each person gets their own login and can reset their own password by email. Removing
          someone signs them out immediately, everywhere.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so accounts cannot be created.
          </p>
        )}

        {!emailAdapter.isConfigured() && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            Email is not configured, so password reset links cannot be sent. An owner can still
            set someone a new password by recreating their account.
          </p>
        )}

        <div className="mt-9">
          <TeamEditor users={users} me={session.user} bootstrap={session.bootstrap} />
        </div>

        {session.user && (
          <div className="mt-4">
            <ChangePassword />
          </div>
        )}
      </main>
    </>
  );
}
