import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/data/site';
import { getFeaturedServices } from '@/lib/catalogue';
import Hero from '@/components/sections/Hero';
import Philosophy from '@/components/sections/Philosophy';
import SignatureServices from '@/components/sections/SignatureServices';
import Rooms from '@/components/sections/Rooms';
import Experience from '@/components/sections/Experience';
import Transformations from '@/components/sections/Transformations';
import TestimonialsCarousel from '@/components/sections/TestimonialsCarousel';
import InstagramStrip from '@/components/sections/InstagramStrip';
import LocationSection from '@/components/sections/LocationSection';
import CtaBand from '@/components/sections/CtaBand';

export const metadata: Metadata = buildMetadata({
  title: 'Marilux Beauty Bar — Luxury Beauty Destination in Accra',
  description: SITE.description,
  path: '/',
});

export default async function HomePage() {
  const featured = await getFeaturedServices();
  const picks = featured
    .filter((s) => s.categorySlug !== 'beauty-institute')
    .slice(0, 10)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      priceFrom: s.priceFrom,
      category: s.category,
      categorySlug: s.categorySlug,
      imageUrl: s.imageUrl,
    }));

  return (
    <>
      <Hero />
      <Philosophy />
      <SignatureServices picks={picks} />
      <Rooms />
      <Experience />
      <Transformations />
      <TestimonialsCarousel />
      <InstagramStrip />
      <LocationSection />
      <CtaBand />
    </>
  );
}
