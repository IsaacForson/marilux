import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminConfigured } from '@/lib/admin/auth';
import Aura from '@/components/ui/Aura';

/** Shown when the deployment has no admin credentials yet. */
export default function AdminSetupPage() {
  if (adminConfigured()) redirect('/admin/login');

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-[var(--edge)] py-20">
      <Aura className="left-1/2 top-1/4 -translate-x-1/2" color="rgba(192,138,126,0.16)" size={600} />
      <div className="relative w-full max-w-xl">
        <div className="glass rounded-[1.75rem] p-8 sm:p-10">
          <p className="eyebrow mb-5">Setup required</p>
          <h1 className="display-sm">The dashboard is not configured yet.</h1>
          <p className="mt-4 leading-relaxed text-ivory/55">
            Add these to your environment, then restart the server. Until they are set, the
            dashboard stays closed — there is no default password. You will use{' '}
            <code className="text-accent">ADMIN_PASSWORD</code> once, to create your first
            account; after that everyone signs in with their own email.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-fill p-5 text-xs leading-relaxed text-ivory/75">
            <code>{`ADMIN_PASSWORD=choose-a-long-password
ADMIN_SESSION_SECRET=$(openssl rand -base64 32)`}</code>
          </pre>

          <p className="mt-6 text-sm leading-relaxed text-ivory/45">
            <code className="text-accent">ADMIN_SESSION_SECRET</code> signs the session cookie.
            Generate a long random value and keep it out of version control.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block font-sans text-2xs uppercase tracking-luxe text-accent underline decoration-accent/40 underline-offset-8"
          >
            Back to the site
          </Link>
        </div>
      </div>
    </main>
  );
}
