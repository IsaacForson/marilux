'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { NAV_LINKS, SITE, telLink, whatsappLink } from '@/lib/data/site';
import { BEZIER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { lockScroll, unlockScroll } from '@/components/providers/SmoothScroll';
import { ButtonLink } from '@/components/ui/Button';
import Wordmark from './Wordmark';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the drawer on navigation, and never leave scroll locked behind.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) lockScroll();
    else unlockScroll();
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /**
   * Two behaviours, one ScrollTrigger: condense past the fold, and hide the
   * bar while scrolling down so the reading surface stays uninterrupted.
   */
  useIsomorphicLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const show = gsap.to(el, {
        yPercent: -140,
        duration: 0.5,
        ease: 'power3.out',
        paused: true,
      });

      ScrollTrigger.create({
        start: 'top -8',
        end: 99999,
        onUpdate: (self) => {
          setCondensed(self.scroll() > 40);
          if (self.direction === 1 && self.scroll() > 260) show.play();
          else show.reverse();
        },
      });
    }, bar);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:rounded-full focus:bg-champagne focus:px-5 focus:py-2.5 focus:text-2xs focus:uppercase focus:tracking-luxe focus:text-onaccent"
      >
        Skip to content
      </a>

      <header
        ref={bar}
        className="fixed inset-x-0 top-0 z-[120] gpu"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="shell">
          <div
            className={cn(
              'flex items-center justify-between rounded-full transition-all duration-700 ease-luxe',
              condensed
                ? 'glass px-4 py-2.5 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.9)] sm:px-5'
                : 'border border-transparent px-0 py-4',
            )}
          >
            <Link
              href="/"
              aria-label={SITE.name + ' — home'}
              className={cn('transition-all duration-700 ease-luxe', condensed && 'pl-2')}
            >
              <Wordmark condensed={condensed} />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const active =
                    link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group relative block px-4 py-2 font-sans text-[0.66rem] uppercase tracking-luxe transition-colors duration-500',
                          active ? 'text-accent' : 'text-ivory/65 hover:text-ivory',
                        )}
                      >
                        {link.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-4 bottom-1 h-px origin-left bg-accent/70 transition-transform duration-500 ease-luxe',
                            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href={telLink}
                aria-label={'Call ' + SITE.name}
                className="hidden h-11 w-11 items-center justify-center rounded-full border border-line-2 text-ivory/70 transition-colors duration-500 hover:border-accent/60 hover:text-accent sm:flex"
              >
                <Phone className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
              </a>

              <ThemeToggle />

              <ButtonLink href="/booking" size="sm">
                Book
              </ButtonLink>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-ivory transition-colors duration-500 hover:border-accent/60 lg:hidden"
              >
                <span className="relative block h-3 w-4">
                  <span
                    className={cn(
                      'absolute left-0 block h-px w-full bg-current transition-all duration-500 ease-luxe',
                      open ? 'top-1.5 rotate-45' : 'top-0',
                    )}
                  />
                  <span
                    className={cn(
                      'absolute left-0 block h-px bg-current transition-all duration-500 ease-luxe',
                      open ? 'top-1.5 w-full -rotate-45' : 'top-3 w-2/3',
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={open} onClose={() => setOpen(false)} pathname={pathname} />
    </>
  );
}

function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.15 } }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[110] lg:hidden"
        >
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.75, ease: BEZIER.luxe }}
            className="absolute inset-0 bg-ink grain"
          >
            <div
              aria-hidden="true"
              className="aura absolute -right-24 top-10 h-[420px] w-[420px]"
              style={{
                background:
                  'radial-gradient(circle, rgba(217,188,140,0.20) 0%, transparent 68%)',
              }}
            />
          </motion.div>

          <div className="relative flex h-full flex-col justify-between overflow-y-auto px-[var(--edge)] pb-10 pt-32">
            <nav aria-label="Mobile">
              <ul>
                {NAV_LINKS.map((link, i) => {
                  const active =
                    link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                  return (
                    <li key={link.href} className="overflow-hidden border-b border-line">
                      <motion.div
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '110%', transition: { duration: 0.3 } }}
                        transition={{ duration: 0.8, ease: BEZIER.luxe, delay: 0.16 + i * 0.055 }}
                      >
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="flex items-baseline justify-between py-4"
                        >
                          <span
                            className={cn(
                              'display-md',
                              active ? 'gold-text' : 'text-ivory',
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="font-sans text-2xs tracking-luxe text-ivory/25">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-12 space-y-6"
            >
              <ButtonLink href="/booking" size="lg" className="w-full" arrow>
                Reserve your seat
              </ButtonLink>

              <div className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-2xs uppercase tracking-luxe text-ivory/45">
                <a href={telLink} className="hover:text-accent">
                  {SITE.contact.phone}
                </a>
                <a
                  href={whatsappLink('Hello Marilux, I would like to make an enquiry.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  WhatsApp
                </a>
                <a
                  href={SITE.socials.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  Instagram
                </a>
              </div>

              <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/30">
                {SITE.address.display}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
