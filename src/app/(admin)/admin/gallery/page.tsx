import { requireAdmin } from '@/lib/admin/auth';
import { galleryIsCustom, getGalleryForAdmin } from '@/lib/media/gallery';
import { GALLERY, galleryBeforeSrc, galleryPhotoSrc } from '@/lib/data/gallery';
import { bookings, statusCount, usingDatabase } from '@/lib/store/bookings';
import { storageBackend } from '@/lib/media/storage';
import AdminNav from '@/components/admin/AdminNav';
import GalleryEditor, { type AdminGalleryItem } from '@/components/admin/GalleryEditor';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  await requireAdmin();

  const [custom, dbItems, all] = await Promise.all([
    galleryIsCustom(),
    getGalleryForAdmin(),
    bookings.all(),
  ]);

  const items: AdminGalleryItem[] = custom
    ? dbItems.map((g) => ({ ...g, kind: g.kind ?? 'image' }))
    : GALLERY.map((g, i) => ({
        title: g.title,
        caption: g.caption,
        categorySlug: g.categorySlug,
        kind: g.kind ?? 'image',
        span: g.span,
        sortOrder: i,
        isActive: true,
        imageUrl: galleryPhotoSrc(g),
        beforeUrl: galleryBeforeSrc(g),
      }));

  return (
    <>
      <AdminNav pending={statusCount(all, 'pending')} />

      <main className="mx-auto max-w-5xl px-[var(--edge)] py-10">
        <p className="eyebrow mb-3">Gallery</p>
        <h1 className="display-md">Your work, on show.</h1>
        <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ivory/45">
          Upload straight from your phone — pictures are rotated, resized and compressed
          automatically, so a 4 MB photo becomes a fast-loading image without you doing
          anything. Images are stored{' '}
          {storageBackend() === 'supabase' ? 'in Supabase Storage' : 'in your database'}.
        </p>

        {!usingDatabase && (
          <p className="mt-6 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            No database is connected, so the gallery cannot be edited.
          </p>
        )}

        <div className="mt-9">
          <GalleryEditor items={items} isCustom={custom} />
        </div>
      </main>
    </>
  );
}
