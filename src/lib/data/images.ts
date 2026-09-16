/**
 * Photography library.
 *
 * All imagery is licensed under the Pexels License (free for commercial use,
 * no attribution required) and lives in `/public/images`. Sources are recorded
 * in `CREDITS.md`.
 *
 * Components reference a *theme* rather than a file, so the studio can swap in
 * its own photography by replacing the files in a pool — no component changes.
 */

export type ImageTheme =
  | 'brows'
  | 'lashes'
  | 'hair'
  | 'nails'
  | 'skin'
  | 'spa'
  | 'makeup'
  | 'portrait'
  | 'studio';

export type Photo = { src: string; alt: string };

const p = (file: string, alt: string): Photo => ({ src: '/images/' + file + '.jpg', alt });

export const PHOTOS: Record<ImageTheme, Photo[]> = {
  brows: [
    p('brows-01', 'Close detail of laminated, brushed-up brows'),
    p('brows-02', 'Close detail of a defined brow and lash line'),
    p('brows-03', 'A guest in profile during a brow appointment'),
    p('brows-04', 'A guest with defined, finished brows after treatment'),
    p('brows-05', 'Close portrait of finished brow and skin work'),
  ],
  lashes: [
    p('lashes-01', 'A lash artist isolating and applying extensions'),
    p('lashes-02', 'Lash extensions applied one at a time under eye pads'),
    p('lashes-03', 'A guest resting during a lash appointment'),
    p('lashes-04', 'A brush shaping lashes during a treatment'),
    p('lashes-05', 'Close detail of a finished lash line'),
  ],
  hair: [
    p('hair-01', 'A stylist at work on the salon floor'),
    p('hair-02', 'Hand-braiding in progress, section by section'),
    p('hair-03', 'A guest having her hair styled in the studio'),
    p('hair-04', 'A finished braided style, photographed in profile'),
    p('hair-05', 'Braiding work close to the scalp, tension-free'),
    p('hair-06', 'Wig units prepared and ready for customisation'),
  ],
  nails: [
    p('nails-01', 'A nail technician applying colour by hand'),
    p('nails-02', 'Nail preparation with sterilised tooling'),
    p('nails-03', 'A guest at the nail bar during her appointment'),
    p('nails-04', 'A manicure in progress in the studio'),
    p('nails-05', 'Finished nails, photographed in daylight'),
  ],
  skin: [
    p('skin-01', 'A guest during a facial, mask applied'),
    p('skin-02', 'A facial treatment in the private skin room'),
    p('skin-03', 'Device-assisted skin work during a facial'),
    p('skin-04', 'A therapist working through a facial protocol'),
    p('skin-05', 'Skin prep before makeup application'),
  ],
  spa: [
    p('spa-01', 'A guest resting under eye pads in the spa suite'),
    p('spa-02', 'Facial massage during a spa ritual'),
    p('spa-03', 'A guest relaxing during a treatment'),
    p('spa-04', 'The spa suite, low-lit and quiet'),
  ],
  makeup: [
    p('makeup-01', 'A makeup artist working on a client’s eye'),
    p('makeup-02', 'Makeup application, matched to the client’s undertone'),
    p('makeup-03', 'Two artists finishing a look together'),
    p('makeup-04', 'A guest mid-application, smiling'),
    p('makeup-05', 'A finished soft-glam look in natural light'),
  ],
  portrait: [
    p('portrait-01', 'A guest photographed after her appointment'),
    p('portrait-02', 'A finished braided style, photographed in profile'),
    p('portrait-03', 'A portrait of a Marilux client'),
    p('portrait-04', 'A portrait in natural light after treatment'),
    p('portrait-05', 'A client smiling after her appointment'),
    p('portrait-06', 'A portrait of a Marilux guest'),
  ],
  studio: [
    p('studio-01', 'Detail of the treatment floor at Marilux'),
    p('studio-02', 'Tools laid out before an appointment'),
    p('studio-03', 'The studio interior, warm and low-lit'),
    p('studio-04', 'A quiet moment in the studio'),
  ],
};

/** Deterministic pick so the same slot always shows the same photograph. */
export function photo(theme: ImageTheme, index = 0): Photo {
  const pool = PHOTOS[theme];
  return pool[((index % pool.length) + pool.length) % pool.length];
}

/** Each service category maps to the pool that best represents its room. */
export const CATEGORY_THEME: Record<string, ImageTheme> = {
  'brows-permanent-makeup': 'brows',
  lashes: 'lashes',
  'hair-wigs-installation': 'hair',
  'nails-manicure-pedicure': 'nails',
  'facials-skincare': 'skin',
  'waxing-hair-removal': 'spa',
  'body-spa-wellness': 'spa',
  'aesthetic-enhancement': 'makeup',
  'beauty-institute': 'studio',
  'beauty-packages': 'portrait',
};

export const themeFor = (categorySlug?: string): ImageTheme =>
  (categorySlug && CATEGORY_THEME[categorySlug]) || 'portrait';
