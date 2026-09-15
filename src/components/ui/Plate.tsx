import Image from 'next/image';
import { cn } from '@/lib/utils';
import { photo, type ImageTheme } from '@/lib/data/images';

type PlateProps = {
  /** An explicit file path wins over the themed pool. */
  src?: string;
  alt?: string;
  /** Pick from a themed photography pool instead of naming a file. */
  theme?: ImageTheme;
  /** Which photograph within the pool. Deterministic, so slots stay stable. */
  index?: number;
  /** Hue seed for the generated fallback, used only when no photo resolves. */
  seed?: number;
  className?: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  /** Soft dark scrim for text laid over the image. */
  scrim?: boolean;
  children?: React.ReactNode;
  rounded?: string;
  /** Crop focus, e.g. "50% 25%" to favour a face near the top. */
  position?: string;
};

/**
 * Image surface.
 *
 * Resolves, in order: an explicit `src`, a photograph from a themed pool, or —
 * if neither is given — a generated warm-light composition so a slot can never
 * render as a broken or empty box.
 */
export default function Plate({
  src,
  alt,
  theme,
  index = 0,
  seed = 40,
  className,
  ratio = 'aspect-[4/5]',
  priority,
  sizes = '(max-width: 768px) 100vw, 50vw',
  scrim,
  children,
  rounded = 'rounded-[1.75rem]',
  position = 'center',
}: PlateProps) {
  const resolved = src ? { src, alt: alt ?? '' } : theme ? photo(theme, index) : null;
  const label = alt ?? resolved?.alt ?? '';

  const h1 = 10 + (seed % 7) * 5.5;
  const h2 = 4 + ((seed + 3) % 6) * 6;

  return (
    <div
      className={cn(
        // `on-media` pins the colour tokens for anything laid over the photo.
        'on-media relative isolate overflow-hidden bg-ink-800 grain',
        ratio,
        rounded,
        className,
      )}
    >
      {resolved ? (
        <Image
          src={resolved.src}
          alt={label}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <div
          role="img"
          aria-label={label}
          className="absolute inset-0"
          style={{
            backgroundColor: '#211A15',
            backgroundImage: [
              'radial-gradient(68% 54% at 30% 24%, hsl(' +
                h1 +
                ' 62% 74% / 0.62) 0%, transparent 64%)',
              'radial-gradient(58% 50% at 78% 70%, hsl(' +
                h2 +
                ' 48% 60% / 0.48) 0%, transparent 68%)',
              'radial-gradient(44% 34% at 58% 40%, rgba(244,226,196,0.34) 0%, transparent 72%)',
              'repeating-linear-gradient(112deg, rgba(255,255,255,0.032) 0px, rgba(255,255,255,0.032) 1px, transparent 1px, transparent 9px)',
              'radial-gradient(112% 82% at 50% 42%, transparent 44%, rgba(11,10,9,0.62) 100%)',
            ].join(','),
          }}
        />
      )}

      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 ring-1 ring-inset ring-line',
          rounded,
        )}
      />

      {scrim && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/40 to-transparent"
        />
      )}

      {children}
    </div>
  );
}
