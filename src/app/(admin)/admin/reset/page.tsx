import Aura from '@/components/ui/Aura';
import ResetForm from '@/components/admin/ResetForm';

export const dynamic = 'force-dynamic';

export default async function AdminResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-[var(--edge)] py-20">
      <Aura className="left-1/2 top-1/4 -translate-x-1/2" color="rgba(217,188,140,0.16)" size={620} />
      <div className="relative w-full max-w-sm">
        <ResetForm token={token ?? ''} />
      </div>
    </main>
  );
}
