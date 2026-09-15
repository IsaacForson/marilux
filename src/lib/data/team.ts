export type Specialist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Category slugs this specialist can be booked for. */
  categories: string[];
  years: number;
  signature: string;
  /** Slot in the portrait photography pool. */
  photoIndex: number;
};

export const SPECIALISTS: Specialist[] = [
  {
    slug: 'mariam',
    name: 'Mariam',
    role: 'Founder & Lead Brow Artist',
    bio: 'Mariam built Marilux around a single conviction: that precision is a form of care. She trains every artist in the studio and still takes brow clients six days a week.',
    categories: ['brows-permanent-makeup', 'aesthetic-enhancement', 'beauty-institute'],
    years: 9,
    photoIndex: 2,
    signature: 'Combination brows',
  },
  {
    slug: 'afia',
    name: 'Afia',
    role: 'Senior Lash Artist',
    bio: 'Afia maps lashes the way an architect draws elevations. Her wispy sets have a waiting list, and her retention rates are the best in the studio.',
    categories: ['lashes', 'brows-permanent-makeup'],
    years: 6,
    photoIndex: 5,
    signature: 'Wispy angel sets',
  },
  {
    slug: 'nadia',
    name: 'Nadia',
    role: 'Skin Therapist',
    bio: 'Certified in advanced aesthetics, Nadia specialises in hyperpigmentation and barrier repair on deep complexions. She will always tell you the honest timeline.',
    categories: ['facials-skincare', 'body-spa-wellness'],
    years: 7,
    photoIndex: 3,
    signature: 'Brightening protocols',
  },
  {
    slug: 'esi',
    name: 'Esi',
    role: 'Hair & Wig Specialist',
    bio: 'Esi customises units by hand — every knot bleached, every hairline plucked to sit like scalp. Her installs have gone down aisles across three continents.',
    categories: ['hair-wigs-installation', 'aesthetic-enhancement'],
    years: 8,
    photoIndex: 1,
    signature: 'Invisible frontal melts',
  },
  {
    slug: 'kukua',
    name: 'Kukua',
    role: 'Nail Artist',
    bio: 'Structure first, art second. Kukua builds an apex that holds for four weeks and then paints something you will photograph every day.',
    categories: ['nails-manicure-pedicure'],
    years: 5,
    photoIndex: 0,
    signature: 'Sculpted gel-x',
  },
  {
    slug: 'joyce',
    name: 'Joyce',
    role: 'Wax & Body Therapist',
    bio: 'Fast hands, calm room. Joyce has made a career of turning the appointment people dread into the one they rebook first.',
    categories: ['waxing-hair-removal', 'body-spa-wellness'],
    years: 6,
    photoIndex: 4,
    signature: 'Fifteen-minute Brazilians',
  },
];

export const specialistsFor = (categorySlug?: string) =>
  categorySlug ? SPECIALISTS.filter((s) => s.categories.includes(categorySlug)) : SPECIALISTS;
