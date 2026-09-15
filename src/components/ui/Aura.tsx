import { cn } from '@/lib/utils';

/**
 * Ambient light bloom.
 *
 * Blurred radials are expensive to repaint, so these are fixed-size, animated
 * only by transform, and never sized as a percentage of a scrolling parent.
 */
export default function Aura({
  className,
  color = 'rgba(217,188,140,0.16)',
  size = 620,
  animate = true,
}: {
  className?: string;
  color?: string;
  size?: number;
  animate?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('aura', animate && 'animate-aura', className)}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle, ' + color + ' 0%, transparent 68%)',
      }}
    />
  );
}
