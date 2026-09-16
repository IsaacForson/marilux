import { requireAdmin } from '@/lib/admin/auth';
import { getSetting } from '@/lib/settings/store';
import { bookings, statusCount, usingDatabase } from '@/lib/store/bookings';
import AdminNav from '@/components/admin/AdminNav';
import TemplateEditor from '@/components/admin/TemplateEditor';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  await requireAdmin();

  const [templates, all] = await Promise.all([getSetting('templates'), bookings.all()]);

  return (
    <>
      <AdminNav pending={statusCount(all, 'pending')} />

      <main className="mx-auto max-w-5xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Messages</p>
        <h1 className="display-md">What your clients read.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          Rewrite any confirmation, reminder or decline in your own words. Leave a field blank
          and we use our wording — so you can change just the text message and keep the email as
          it is.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so message changes cannot be saved.
          </p>
        )}

        <div className="mt-9">
          <TemplateEditor initial={templates} />
        </div>
      </main>
    </>
  );
}
