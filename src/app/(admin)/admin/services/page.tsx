import { requireAdmin } from '@/lib/admin/auth';
import { getFullCatalogue } from '@/lib/catalogue';
import { bookings, statusCount, usingDatabase } from '@/lib/store/bookings';
import AdminNav from '@/components/admin/AdminNav';
import PriceEditor from '@/components/admin/PriceEditor';

export const dynamic = 'force-dynamic';

export default async function AdminServicesPage() {
  await requireAdmin();

  const [categories, all] = await Promise.all([getFullCatalogue(), bookings.all()]);
  const total = categories.reduce((n, c) => n + c.services.length, 0);
  const edited = categories.reduce(
    (n, c) => n + c.services.filter((s) => s.overridden).length,
    0,
  );

  return (
    <>
      <AdminNav pending={statusCount(all, 'pending')} />

      <main className="mx-auto max-w-5xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Prices & services</p>
        <h1 className="display-md">Change a price, any time.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          {total} treatments across {categories.length} categories
          {edited > 0 && ' · ' + edited + ' with your own pricing'}. Edits go live on the website
          as soon as you save. The eye icon hides a treatment without deleting it; the arrow
          restores the original price.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so price changes cannot be saved. Set{' '}
            <code className="text-accent">DATABASE_URL</code> and restart.
          </p>
        )}

        <div className="mt-9">
          <PriceEditor categories={categories} />
        </div>
      </main>
    </>
  );
}
