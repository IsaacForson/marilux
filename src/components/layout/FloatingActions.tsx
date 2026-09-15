'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { CalendarCheck } from 'lucide-react';
import { SITE, whatsappLink } from '@/lib/data/site';
import { BEZIER } from '@/lib/motion';

/**
 * Persistent conversion rail.
 *
 * Appears once the visitor is past the hero, and hides on the booking flow
 * itself, where it would compete with the step controls.
 */
export default function FloatingActions() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const hidden = pathname.startsWith('/booking');

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && !hidden && (
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 26 }}
          transition={{ duration: 0.55, ease: BEZIER.luxe }}
          className="fixed bottom-0 right-0 z-[100] flex items-center gap-2.5 p-[var(--edge)] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <a
            href={whatsappLink('Hello Marilux, I would like to book an appointment.')}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={'Message ' + SITE.shortName + ' on WhatsApp'}
            className="grid h-13 w-13 place-items-center rounded-full border border-line-2 bg-ink/80 text-ivory backdrop-blur-xl transition-all duration-500 ease-luxe hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent"
            style={{ height: '3.25rem', width: '3.25rem' }}
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
          </a>

          <Link
            href="/booking"
            className="group flex h-[3.25rem] items-center gap-2.5 rounded-full bg-champagne px-6 font-sans text-[0.66rem] uppercase tracking-luxe text-onaccent transition-all duration-500 ease-luxe hover:-translate-y-0.5 hover:bg-champagne-light"
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
            Book now
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
