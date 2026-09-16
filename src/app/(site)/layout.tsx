import { Suspense } from 'react';
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
 * The banner is a streamed slot so a slow settings query cannot hold the rest
 * of the page — or the next client navigation — hostage.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={businessJsonLd()} />
      <Preloader />
      <Cursor />
      <SmoothScroll>
        <Suspense fallback={null}>
          <AnnouncementSlot />
        </Suspense>
        <Navigation />
        <main id="main">{children}</main>
        <Footer />
        <FloatingActions />
      </SmoothScroll>
    </>
  );
}

async function AnnouncementSlot() {
  const banner = await getSetting('banner');
  const showBanner = banner.enabled && banner.message.trim().length > 0;

  return (
    <>
      {showBanner ? (
        <style
          dangerouslySetInnerHTML={{
            __html: ':root{--announcement-h:calc(2.5rem + env(safe-area-inset-top,0px))}',
          }}
        />
      ) : null}
      <AnnouncementBanner banner={banner} />
    </>
  );
}
