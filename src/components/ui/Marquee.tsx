import { cn } from '@/lib/utils';

/**
 * Infinite ticker.
 *
 * The track holds two identical halves and translates by exactly -50%, so the
 * loop is seamless with a single CSS animation and no JS on the scroll path.
 */
export default function Marquee({
  items,
  className,
  separator = '—',
  reverse = false,
}: {
  items: string[];
  className?: string;
  separator?: string;
  reverse?: boolean;
}) {
  const half = (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={item + i} className="flex items-center whitespace-nowrap">
          <span className="px-6 sm:px-10">{item}</span>
          <span className="text-champagne/45">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={cn('relative flex overflow-hidden', className)}>
      <div
        className={cn('flex w-max animate-marquee gpu', reverse && '[animation-direction:reverse]')}
      >
        {half}
        {half}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-transparent to-ink"
      />
    </div>
  );
}
