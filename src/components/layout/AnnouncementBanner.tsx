'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import type { BannerSettings } from '@/lib/settings/types';

/**
 * Site-wide promo strip. Height is written to `--announcement-h` so the
 * fixed navigation can sit beneath it instead of covering the message.
 */
export default function AnnouncementBanner({ banner }: { banner: BannerSettings }) {
  const root = useRef<HTMLDivElement>(null);
  const message = banner.message.trim();
  const show = banner.enabled && message.length > 0;

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!show || !el) {
      document.documentElement.style.setProperty('--announcement-h', '0px');
      return;
    }

    const apply = () => {
      document.documentElement.style.setProperty('--announcement-h', el.offsetHeight + 'px');
    };
    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty('--announcement-h', '0px');
    };
  }, [show]);

  if (!show) return null;

  const label = banner.linkLabel.trim();
  const href = banner.linkHref || '/booking';

  return (
    <div
      ref={root}
      role="region"
      aria-label="Announcement"
      className="fixed inset-x-0 top-0 z-[121] bg-champagne text-onaccent"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-[var(--edge)] py-2.5 text-center">
        <p className="font-sans text-[0.68rem] font-medium uppercase tracking-luxe">{message}</p>
        {label ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-sans text-[0.62rem] uppercase tracking-luxe underline decoration-onaccent/35 underline-offset-4 transition-colors hover:decoration-onaccent"
          >
            {label}
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.6} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
