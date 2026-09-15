import { cn } from '@/lib/utils';

export default function Wordmark({
  condensed = false,
  className,
}: {
  condensed?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'grid place-items-center rounded-full border border-champagne/45 font-display leading-none text-champagne transition-all duration-700 ease-luxe',
          condensed ? 'h-8 w-8 text-sm' : 'h-9 w-9 text-base',
        )}
      >
        M
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display tracking-[0.18em] text-ivory transition-all duration-700 ease-luxe',
            condensed ? 'text-sm' : 'text-base',
          )}
        >
          MARILUX
        </span>
        <span
          className={cn(
            'overflow-hidden font-sans text-[0.5rem] uppercase tracking-wide2 text-champagne/60 transition-all duration-700 ease-luxe',
            condensed ? 'mt-0 max-h-0 opacity-0' : 'mt-1 max-h-4 opacity-100',
          )}
        >
          Beauty Bar
        </span>
      </span>
    </span>
  );
}
