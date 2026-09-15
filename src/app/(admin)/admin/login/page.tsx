import { redirect } from 'next/navigation';
import { adminConfigured, isSignedIn } from '@/lib/admin/auth';
import LoginForm from '@/components/admin/LoginForm';
import Aura from '@/components/ui/Aura';

export default async function AdminLoginPage() {
  if (!adminConfigured()) redirect('/admin/setup');
  if (await isSignedIn()) redirect('/admin');

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-[var(--edge)] py-20">
      <Aura className="left-1/2 top-1/4 -translate-x-1/2" color="rgba(217,188,140,0.16)" size={620} />
      <div className="relative w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
