import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import { SITE } from '@/lib/data/site';
import { buildMetadata, businessJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Preloader from '@/components/providers/Preloader';
import Cursor from '@/components/providers/Cursor';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/layout/FloatingActions';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  ...buildMetadata({
    title: 'Marilux Beauty Bar — Luxury Beauty Destination in Accra',
    description: SITE.description,
  }),
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: true, address: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0A09',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={display.variable + ' ' + sans.variable}>
      <body>
        <JsonLd data={businessJsonLd()} />
        <Preloader />
        <Cursor />
        <SmoothScroll>
          <Navigation />
          <main id="main">{children}</main>
          <Footer />
          <FloatingActions />
        </SmoothScroll>
      </body>
    </html>
  );
}
