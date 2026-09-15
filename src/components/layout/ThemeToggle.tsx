'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

/**
 * Light/dark switch.
 *
 * Renders both icons and cross-fades them with transforms, so the control
 * never reflows and needs no state-dependent markup that could mismatch
 * during hydration.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle, ready } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={!isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-line-2 text-ivory/70 transition-colors duration-500 hover:border-accent/60 hover:text-accent',
        !ready && 'opacity-0',
        className,
      )}
    >
      <Sun
        className={cn(
          'absolute h-4 w-4 transition-all duration-500 ease-luxe',
          isDark ? 'translate-y-0 rotate-0 opacity-100' : '-translate-y-6 rotate-90 opacity-0',
        )}
        strokeWidth={1.4}
        aria-hidden="true"
      />
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all duration-500 ease-luxe',
          isDark ? 'translate-y-6 -rotate-90 opacity-0' : 'translate-y-0 rotate-0 opacity-100',
        )}
        strokeWidth={1.4}
        aria-hidden="true"
      />
    </button>
  );
}
