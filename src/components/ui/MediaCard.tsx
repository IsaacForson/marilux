import { cn } from '@/lib/utils';

/**
 * A card that floats over photography.
 *
 * `glass` is only legible over a surface we control. These cards sit on top of
 * photographs whose brightness we do not — over a pale shot the translucent
 * backing left the type unreadable in dark mode — so they carry their own dark
 * plate, and `on-media` pins the colour tokens light in both themes.
 *
 * Use this instead of `glass` for anything overlapping an image.
 */
export default function MediaCard({
  children,
  className,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...rest}
      className={cn(
        'on-media rounded-2xl border border-white/12 bg-[#0B0A09]/85 p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </div>
  );
}
