import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio — Marilux Beauty Bar',
  // The dashboard must never be indexed, even if a URL leaks.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell.
 *
 * Deliberately bare: no smooth-scroll rig, no intro curtain, no custom cursor,
 * no marketing navigation. A tool the owner uses every morning should be fast
 * and quiet, not cinematic.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ink text-ivory">{children}</div>;
}
