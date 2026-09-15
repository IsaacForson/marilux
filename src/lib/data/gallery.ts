import type { ImageTheme } from './images';

export type GalleryItem = {
  id: string;
  title: string;
  categorySlug: string;
  category: string;
  /** Layout weight in the masonry grid. */
  span: 'tall' | 'wide' | 'square' | 'portrait';
  /** Photography pool and slot. Explicit per item so nothing repeats on screen. */
  theme: ImageTheme;
  index: number;
  kind?: 'image' | 'video' | 'before-after';
  caption?: string;
  /** Overrides the pool entirely once real photography is shot. */
  src?: string;
  beforeSrc?: string;
};

export const GALLERY_FILTERS = [
  { slug: 'all', label: 'Everything' },
  { slug: 'brows-permanent-makeup', label: 'Brows' },
  { slug: 'lashes', label: 'Lashes' },
  { slug: 'hair-wigs-installation', label: 'Hair' },
  { slug: 'nails-manicure-pedicure', label: 'Nails' },
  { slug: 'facials-skincare', label: 'Skin' },
  { slug: 'aesthetic-enhancement', label: 'Makeup' },
  { slug: 'body-spa-wellness', label: 'Spa' },
] as const;

const raw: Array<Omit<GalleryItem, 'id'>> = [
  { title: 'Combination brows, healed at eight weeks', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'portrait', theme: 'brows', index: 3, kind: 'before-after', caption: 'Two sessions. No pencil since.' },
  { title: 'Wispy angel set', categorySlug: 'lashes', category: 'Lashes', span: 'square', theme: 'lashes', index: 0 },
  { title: 'Frontal melt, cut and styled', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'tall', theme: 'hair', index: 3 },
  { title: 'Sculpted gel-x, almond', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'square', theme: 'nails', index: 4 },
  { title: 'Brightening course, month four', categorySlug: 'facials-skincare', category: 'Skin', span: 'portrait', theme: 'skin', index: 0, kind: 'before-after', caption: 'Six treatments across sixteen weeks.' },
  { title: 'Soft glam in natural light', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'wide', theme: 'makeup', index: 4 },
  { title: 'The spa suite at seven a.m.', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'wide', theme: 'spa', index: 3 },
  { title: 'Ombré powder brows, day one', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'square', theme: 'brows', index: 1 },
  { title: 'Mega volume, close', categorySlug: 'lashes', category: 'Lashes', span: 'portrait', theme: 'lashes', index: 4 },
  { title: 'Knot bleaching, in progress', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'square', theme: 'hair', index: 5, kind: 'video', caption: 'Forty seconds of the four-hour process.' },
  { title: 'Chrome french, micro line', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'tall', theme: 'nails', index: 0 },
  { title: 'Bridal, morning of', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'portrait', theme: 'makeup', index: 3 },
  { title: 'Lash lift, no extensions', categorySlug: 'lashes', category: 'Lashes', span: 'square', theme: 'lashes', index: 2, kind: 'before-after' },
  { title: 'Silk press with movement', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'portrait', theme: 'portrait', index: 1 },
  { title: 'Luxury spa pedicure', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'wide', theme: 'nails', index: 2 },
  { title: 'Signature facial, the mask stage', categorySlug: 'facials-skincare', category: 'Skin', span: 'square', theme: 'skin', index: 1 },
  { title: 'Brow lamination, brushed up', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'tall', theme: 'brows', index: 0 },
  { title: 'Body polish, shea finish', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'square', theme: 'spa', index: 1 },
  { title: 'Full glam, evening', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'portrait', theme: 'makeup', index: 0 },
  { title: 'Hybrid set, mapped to the eye', categorySlug: 'lashes', category: 'Lashes', span: 'square', theme: 'lashes', index: 1 },
  { title: 'Acrylic full set, long coffin', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'portrait', theme: 'nails', index: 3 },
  { title: 'Hydra glow, the hour after', categorySlug: 'facials-skincare', category: 'Skin', span: 'square', theme: 'skin', index: 3 },
  { title: 'Braided unit, waist length', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'tall', theme: 'hair', index: 1 },
  { title: 'Hot stone, the spa suite', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'portrait', theme: 'spa', index: 0 },
];

export const GALLERY: GalleryItem[] = raw.map((item, i) => ({
  ...item,
  id: 'g' + (i + 1),
  kind: item.kind ?? 'image',
}));
