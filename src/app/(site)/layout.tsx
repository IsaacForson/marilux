import { businessJsonLd } from '@/lib/seo';
import { getSetting } from '@/lib/settings/store';
import JsonLd from '@/components/seo/JsonLd';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Preloader from '@/components/providers/Preloader';
import Cursor from '@/components/providers/Cursor';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';
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
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const banner = await getSetting('banner');
  const showBanner = banner.enabled && banner.message.trim().length > 0;

  return (
    <>
      <JsonLd data={businessJsonLd()} />
      {showBanner ? (
        <style
          dangerouslySetInnerHTML={{
            __html: ':root{--announcement-h:calc(2.5rem + env(safe-area-inset-top,0px))}',
          }}
        />
      ) : null}
      <Preloader />
      <Cursor />
      <SmoothScroll>
        <AnnouncementBanner banner={banner} />
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
      </SmoothScroll>
    </>
  );
}
