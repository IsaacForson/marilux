import { businessJsonLd } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Preloader from '@/components/providers/Preloader';
import Cursor from '@/components/providers/Cursor';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/layout/FloatingActions';

/**
 * Public site chrome.
 *
 * Kept in a route group so the admin dashboard can opt out of the marketing
 * navigation, the smooth-scroll rig, the intro curtain and the custom cursor —
 * none of which belong in a working tool.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={businessJsonLd()} />
      <Preloader />
      <Cursor />
      <SmoothScroll>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
      </SmoothScroll>
    </>
  );
}
