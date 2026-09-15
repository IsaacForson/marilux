import Image from 'next/image';
import { cn } from '@/lib/utils';

type PlateProps = {
  /** Supply a real photograph and the generated plate is replaced entirely. */
  src?: string;
  alt: string;
  /** Deterministic hue seed (0–360) so a given plate always renders the same. */
  seed?: number;
  className?: string;
  /** Aspect ratio utility, e.g. "aspect-[3/4]". */
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  /** Adds a soft dark scrim for text laid over the image. */
  scrim?: boolean;
  children?: React.ReactNode;
  rounded?: string;
};

/**
 * Image surface with a designed fallback.
 *
 * Until real photography is shot, each plate renders a layered warm-light
 * composition derived from its seed — champagne, nude and rose-gold radials
 * over ink, with film grain and a vignette. It reads as art direction rather
 * than as a missing asset, and swapping in `src` later changes nothing else.
 */
export default function Plate({
  src,
  alt,
  seed = 40,
  className,
  ratio = 'aspect-[4/5]',
  priority,
  sizes = '(max-width: 768px) 100vw, 50vw',
  scrim,
  children,
  rounded = 'rounded-[1.75rem]',
}: PlateProps) {
  // Seeds are mapped into the brand's warm band (rose through champagne)
  // rather than the full colour wheel, so no plate can drift off-palette.
  const h1 = 10 + (seed % 7) * 5.5; // 10deg (rose) — 43deg (champagne)
  const h2 = 4 + ((seed + 3) % 6) * 6; // a neighbouring warm tone for the fill

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden bg-ink-800 grain',
        ratio,
        rounded,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0"
          style={{
            backgroundColor: '#211A15',
            backgroundImage: [
              // Key light — warm, off-centre, the brightest mass.
              'radial-gradient(68% 54% at 30% 24%, hsl(' +
                h1 +
                ' 62% 74% / 0.62) 0%, transparent 64%)',
              // Fill light — cooler and lower, shapes the form.
              'radial-gradient(58% 50% at 78% 70%, hsl(' +
                h2 +
                ' 48% 60% / 0.48) 0%, transparent 68%)',
              // Champagne bloom, the signature highlight.
              'radial-gradient(44% 34% at 58% 40%, rgba(244,226,196,0.34) 0%, transparent 72%)',
              // Silk texture.
              'repeating-linear-gradient(112deg, rgba(255,255,255,0.032) 0px, rgba(255,255,255,0.032) 1px, transparent 1px, transparent 9px)',
              // Vignette keeps the subject centred and the edges print-dark.
              'radial-gradient(112% 82% at 50% 42%, transparent 44%, rgba(11,10,9,0.62) 100%)',
            ].join(','),
          }}
        />
      )}

      {/* Inner hairline gives the plate a framed, print-like edge. */}
      <div
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.08]', rounded)}
      />

      {scrim && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent"
        />
      )}

      {children}
    </div>
  );
}
