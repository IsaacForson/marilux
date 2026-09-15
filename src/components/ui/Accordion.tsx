'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BEZIER } from '@/lib/motion';
import { cn } from '@/lib/utils';

export type AccordionItem = {
  id: string;
  title: string;
  body: string | string[];
  meta?: string;
};

export default function Accordion({
  items,
  className,
  defaultOpen,
}: {
  items: AccordionItem[];
  className?: string;
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);

  return (
    <div className={cn('divide-y divide-line border-y border-line', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const body = Array.isArray(item.body) ? item.body : [item.body];

        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={'panel-' + item.id}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-500"
              >
                <span className="flex flex-col gap-1">
                  <span
                    className={cn(
                      'display-sm transition-colors duration-500',
                      isOpen ? 'text-accent' : 'text-ivory group-hover:text-accent/80',
                    )}
                  >
                    {item.title}
                  </span>
                  {item.meta && (
                    <span className="font-sans text-2xs uppercase tracking-luxe text-ivory/35">
                      {item.meta}
                    </span>
                  )}
                </span>
                <Plus
                  className={cn(
                    'mt-1.5 h-5 w-5 shrink-0 text-accent/70 transition-transform duration-500 ease-luxe',
                    isOpen && 'rotate-45',
                  )}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={'panel-' + item.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: BEZIER.luxe }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pb-7 pr-10 text-ivory/60">
                    {body.map((p, i) => (
                      <p key={i} className="max-w-[68ch] leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
