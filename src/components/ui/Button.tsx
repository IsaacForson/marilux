'use client';

import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Magnetic from './Magnetic';

type Variant = 'gold' | 'outline' | 'ghost' | 'ink';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-sans font-medium uppercase tracking-luxe transition-colors duration-500 ease-luxe disabled:pointer-events-none disabled:opacity-40';

const variants: Record<Variant, string> = {
  gold: 'text-onaccent bg-champagne hover:bg-champagne-light',
  outline: 'text-ivory border border-line-3 hover:border-accent/70 hover:text-accent',
  ghost: 'text-ivory/70 hover:text-accent',
  ink: 'bg-ink text-ivory hover:bg-ink-700',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-[0.62rem]',
  md: 'h-12 px-7 text-[0.66rem]',
  lg: 'h-14 px-9 text-[0.7rem] sm:h-[3.75rem] sm:px-11',
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Wraps the control in a magnetic field. Reserve for primary CTAs. */
  magnetic?: boolean;
  arrow?: boolean;
};

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {/* Sheen sweep on hover — a single transform, GPU only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[900ms] ease-luxe group-hover:translate-x-full"
      />
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight
          className="relative z-10 h-4 w-4 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  CommonProps & ButtonHTMLAttributes<HTMLButtonElement>
>(function Button(
  { children, variant = 'gold', size = 'md', className, magnetic, arrow, ...props },
  ref,
) {
  const el = (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
});

export function ButtonLink({
  children,
  href,
  variant = 'gold',
  size = 'md',
  className,
  magnetic,
  arrow,
  ...props
}: CommonProps & { href: string } & React.ComponentPropsWithoutRef<typeof Link>) {
  const external = href.startsWith('http') || href.startsWith('tel') || href.startsWith('mailto');

  const el = external ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </a>
  ) : (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  );

  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
