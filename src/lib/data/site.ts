export const SITE = {
  name: 'Marilux Beauty Bar',
  shortName: 'Marilux',
  tagline: 'The beauty destination',
  description:
    'Marilux Beauty Bar is a luxury beauty destination in Hebron, Accra — brows, lashes, hair, nails, skin and spa, delivered with clinical precision and genuine warmth.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mariluxbeautybar.com',
  locale: 'en_GH',
  founded: 2019,
  contact: {
    phone: '0545489200',
    phoneIntl: '+233545489200',
    whatsapp: '233545489200',
    email: 'Mariluxbeautybar@gmail.com',
  },
  address: {
    street: 'Hebron',
    locality: 'Accra',
    region: 'Greater Accra',
    country: 'GH',
    display: 'Hebron, Accra — Ghana',
  },
  /** Approximate map centre for Hebron, Greater Accra. */
  geo: { lat: 5.7654, lng: -0.2251 },
  socials: {
    instagram: { handle: '@Marilux_beauty', url: 'https://instagram.com/Marilux_beauty' },
    tiktok: { handle: '@Marilux_beauty', url: 'https://tiktok.com/@Marilux_beauty' },
    snapchat: { handle: 'beautyroom3', url: 'https://snapchat.com/add/beautyroom3' },
  },
  hours: [
    { days: 'Monday — Saturday', open: '7:00 AM', close: '7:00 PM', short: 'Mon–Sat 07:00–19:00' },
    { days: 'Sunday', open: '1:00 PM', close: '7:00 PM', short: 'Sun 13:00–19:00' },
  ],
  /** 24h opening hours by JS day index (0 = Sunday). Drives booking slot generation. */
  openingHours: {
    0: { open: 13, close: 19 },
    1: { open: 7, close: 19 },
    2: { open: 7, close: 19 },
    3: { open: 7, close: 19 },
    4: { open: 7, close: 19 },
    5: { open: 7, close: 19 },
    6: { open: 7, close: 19 },
  } as Record<number, { open: number; close: number }>,
  depositPercent: 50,
} as const;

export const whatsappLink = (message?: string) =>
  'https://wa.me/' +
  SITE.contact.whatsapp +
  (message ? '?text=' + encodeURIComponent(message) : '');

export const telLink = 'tel:' + SITE.contact.phoneIntl;
export const mailLink = 'mailto:' + SITE.contact.email;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/institute', label: 'Institute' },
  { href: '/testimonials', label: 'Stories' },
  { href: '/contact', label: 'Contact' },
] as const;
