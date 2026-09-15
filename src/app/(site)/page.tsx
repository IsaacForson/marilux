import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/data/site';
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <Philosophy />
      <SignatureServices />
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
