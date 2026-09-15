export type GalleryItem = {
  id: string;
  title: string;
  categorySlug: string;
  category: string;
  /** Layout weight in the masonry grid. */
  span: 'tall' | 'wide' | 'square' | 'portrait';
  /** Deterministic seed for the placeholder plate until real photography lands. */
  seed: number;
  kind?: 'image' | 'video' | 'before-after';
  caption?: string;
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

const raw: Array<Omit<GalleryItem, 'id' | 'seed'>> = [
  { title: 'Combination brows, healed at eight weeks', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'portrait', kind: 'before-after', caption: 'Two sessions. No pencil since.' },
  { title: 'Wispy angel set', categorySlug: 'lashes', category: 'Lashes', span: 'square' },
  { title: 'Frontal melt, cut and styled', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'tall' },
  { title: 'Sculpted gel-x, almond', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'square' },
  { title: 'Brightening course, month four', categorySlug: 'facials-skincare', category: 'Skin', span: 'portrait', kind: 'before-after', caption: 'Six treatments across sixteen weeks.' },
  { title: 'Soft glam in natural light', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'wide' },
  { title: 'The spa suite at seven a.m.', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'wide' },
  { title: 'Ombré powder brows, day one', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'square' },
  { title: 'Mega volume, close', categorySlug: 'lashes', category: 'Lashes', span: 'portrait' },
  { title: 'Knot bleaching, in progress', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'square', kind: 'video', caption: 'Forty seconds of the four-hour process.' },
  { title: 'Chrome french, micro line', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'tall' },
  { title: 'Bridal, morning of', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'portrait' },
  { title: 'Lash lift, no extensions', categorySlug: 'lashes', category: 'Lashes', span: 'square', kind: 'before-after' },
  { title: 'Silk press with movement', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'portrait' },
  { title: 'Luxury spa pedicure', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'wide' },
  { title: 'Signature facial, the LED stage', categorySlug: 'facials-skincare', category: 'Skin', span: 'square' },
  { title: 'Brow lamination, brushed up', categorySlug: 'brows-permanent-makeup', category: 'Brows', span: 'tall' },
  { title: 'Body polish, shea finish', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'square' },
  { title: 'Full glam, evening', categorySlug: 'aesthetic-enhancement', category: 'Makeup', span: 'portrait' },
  { title: 'Hybrid set, mapped to the eye', categorySlug: 'lashes', category: 'Lashes', span: 'square' },
  { title: 'Acrylic full set, long coffin', categorySlug: 'nails-manicure-pedicure', category: 'Nails', span: 'portrait' },
  { title: 'Hydra glow, the hour after', categorySlug: 'facials-skincare', category: 'Skin', span: 'square' },
  { title: 'Braided unit, waist length', categorySlug: 'hair-wigs-installation', category: 'Hair', span: 'tall' },
  { title: 'Hot stone, the spa suite', categorySlug: 'body-spa-wellness', category: 'Spa', span: 'portrait' },
];

export const GALLERY: GalleryItem[] = raw.map((item, i) => ({
  ...item,
  id: 'g' + (i + 1),
  kind: item.kind ?? 'image',
  seed: (i * 37 + 11) % 360,
}));
