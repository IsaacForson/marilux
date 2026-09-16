import { requireAdmin } from '@/lib/admin/auth';
import { listPromotions } from '@/lib/catalogue/promotions';
import { getFullCatalogue } from '@/lib/catalogue';
import { pendingCount, usingDatabase } from '@/lib/store/bookings';
import AdminNav from '@/components/admin/AdminNav';
import PromotionsEditor from '@/components/admin/PromotionsEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  await requireAdmin();

  const [promotions, categories, pending] = await Promise.all([
    listPromotions(),
    getFullCatalogue(),
    pendingCount(),
  ]);

  return (
    <>
      <AdminNav pending={pending} />

      <main className="mx-auto max-w-4xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Promotions</p>
        <h1 className="display-md">Discounts, offers and codes.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          An automatic promotion applies to everyone in its scope and shows on the website. A
          coupon has a code clients type at checkout. Where both apply, the client gets whichever
          is worth more — they never stack.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so promotions cannot be saved.
          </p>
        )}

        <div className="mt-9">
          <PromotionsEditor promotions={promotions} categories={categories} />
        </div>
      </main>
    </>
  );
}
