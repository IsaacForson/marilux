'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Images,
  MessageSquareText,
  Settings,
  Tag,
  Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Wordmark from '@/components/layout/Wordmark';

const LINKS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: ListChecks },
  { href: '/admin/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/admin/services', label: 'Prices', icon: Tag },
  { href: '/admin/promotions', label: 'Promos', icon: Ticket },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquareText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-[var(--edge)] py-3.5">
        <Link href="/admin" className="shrink-0" aria-label="Marilux studio dashboard">
          <Wordmark condensed />
        </Link>

        <nav aria-label="Dashboard" className="min-w-0 flex-1">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-sans text-2xs uppercase tracking-luxe transition-colors duration-300',
                      active
                        ? 'bg-fill-2 text-accent'
                        : 'text-ivory/50 hover:bg-fill hover:text-ivory',
                    )}
                  >
                    <l.icon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    {l.label}
                    {l.href === '/admin/bookings' && pending > 0 && (
                      <span className="ml-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-champagne px-1 text-[0.6rem] font-medium text-onaccent">
                        {pending}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            className="grid h-11 w-11 place-items-center rounded-full border border-line-2 text-ivory/60 transition-colors duration-300 hover:border-danger/60 hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
