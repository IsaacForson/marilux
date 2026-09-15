export type Testimonial = {
  id: string;
  name: string;
  location: string;
  rating: 1 | 2 | 3 | 4 | 5;
  service: string;
  categorySlug: string;
  quote: string;
  /** Longer story used on the testimonials page. */
  story?: string;
  featured?: boolean;
  since?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Adwoa M.',
    location: 'East Legon',
    rating: 5,
    service: 'Ombré Powder Brows',
    categorySlug: 'brows-permanent-makeup',
    quote:
      'I stopped drawing my brows in September and I have not picked up a pencil since. Mariam measured my face for twenty minutes before she touched me — that is when I knew.',
    story:
      'I had two failed microblading attempts before Marilux and I had genuinely given up. Mariam looked at the old pigment, told me honestly that we would need a correction session first, and gave me a real timeline instead of a sales pitch. Eight months later my brows look like they grew there.',
    featured: true,
    since: 'Client since 2023',
  },
  {
    id: 't2',
    name: 'Selina A.',
    location: 'Spintex',
    rating: 5,
    service: 'Volume Lashes',
    categorySlug: 'lashes',
    quote:
      'Three weeks in and I still have nearly a full set. Afia does not rush, and you can feel it in how long they last.',
    featured: true,
    since: 'Client since 2022',
  },
  {
    id: 't3',
    name: 'Yaa B.',
    location: 'Hebron',
    rating: 5,
    service: 'Brightening Facial — course of six',
    categorySlug: 'facials-skincare',
    quote:
      'Nadia told me it would take four months. It took four months. Nobody in this industry tells you the truth like that.',
    story:
      'The dark marks on my cheeks were from acne I had in my twenties. I had spent so much money on creams. Nadia put me on a course, changed three things in my routine, and made me wear sunscreen daily. The difference in photographs from January to May still makes me emotional.',
    featured: true,
    since: 'Client since 2024',
  },
  {
    id: 't4',
    name: 'Nana Ama K.',
    location: 'Airport Residential',
    rating: 5,
    service: 'The Bridal Chapter',
    categorySlug: 'beauty-packages',
    quote:
      'They ran my wedding morning better than my planner did. Everything was on time, everyone was calm, and I looked like the best version of myself.',
    featured: true,
    since: 'Bride, 2025',
  },
  {
    id: 't5',
    name: 'Efua D.',
    location: 'Tema',
    rating: 5,
    service: 'Frontal Wig Installation',
    categorySlug: 'hair-wigs-installation',
    quote:
      'My colleagues asked me when I did my big chop. That is the whole review.',
    since: 'Client since 2023',
  },
  {
    id: 't6',
    name: 'Abena O.',
    location: 'Madina',
    rating: 5,
    service: 'Gel-X Extensions',
    categorySlug: 'nails-manicure-pedicure',
    quote:
      'Four weeks, no lifting, no breakage. Kukua builds them properly and it shows.',
    since: 'Client since 2024',
  },
  {
    id: 't7',
    name: 'Rita S.',
    location: 'Ashongman',
    rating: 5,
    service: 'Brazilian Wax',
    categorySlug: 'waxing-hair-removal',
    quote:
      'I used to dread this appointment. Joyce is so quick and so normal about it that I now book it without thinking.',
    since: 'Client since 2022',
  },
  {
    id: 't8',
    name: 'Priscilla T.',
    location: 'Kasoa',
    rating: 5,
    service: 'Lash Extension Certification',
    categorySlug: 'beauty-institute',
    quote:
      'I graduated in March and I was fully booked by July. They taught me the business, not just the technique.',
    story:
      'The course was three days but the mentorship has been a year. When I could not price my services properly, I messaged the alumni group and three people answered within the hour. That community is worth more than the certificate.',
    featured: true,
    since: 'Graduate, 2025',
  },
  {
    id: 't9',
    name: 'Linda A.',
    location: 'Haatso',
    rating: 5,
    service: 'Hot Stone Massage',
    categorySlug: 'body-spa-wellness',
    quote:
      'I fell asleep. In a massage. For the first time in my adult life.',
    since: 'Client since 2024',
  },
  {
    id: 't10',
    name: 'Gifty N.',
    location: 'Dome',
    rating: 5,
    service: 'Full Glam Makeup',
    categorySlug: 'aesthetic-enhancement',
    quote:
      'She matched my undertone exactly. No grey cast in a single photograph, indoors or out.',
    since: 'Client since 2023',
  },
  {
    id: 't11',
    name: 'Comfort B.',
    location: 'Adenta',
    rating: 5,
    service: 'The Monthly Ritual',
    categorySlug: 'beauty-packages',
    quote:
      'The same slot every month. It is the one appointment in my calendar I never move.',
    since: 'Client since 2021',
  },
  {
    id: 't12',
    name: 'Zainab I.',
    location: 'Hebron',
    rating: 5,
    service: 'Brow Lamination',
    categorySlug: 'brows-permanent-makeup',
    quote:
      'Forty-five minutes and my face looked lifted. I did not expect that from a brow treatment.',
    since: 'Client since 2025',
  },
];

export const FEATURED_TESTIMONIALS = TESTIMONIALS.filter((t) => t.featured);

export const STATS = [
  { value: 6, suffix: '+', label: 'Years perfecting the craft' },
  { value: 4800, suffix: '+', label: 'Appointments delivered' },
  { value: 120, suffix: '+', label: 'Artists trained & certified' },
  { value: 98, suffix: '%', label: 'Clients who rebook' },
] as const;
