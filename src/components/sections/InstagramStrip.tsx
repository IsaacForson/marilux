import { FaInstagram } from 'react-icons/fa';
import { SITE } from '@/lib/data/site';
import { getGallery } from '@/lib/media/gallery';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';
import Plate from '@/components/ui/Plate';



/**
 * Instagram wall.
 *
 * Renders from local data today; swapping in the Instagram Basic Display or
 * Graph API later means replacing `FEED` with the fetched media array — the
 * item shape is deliberately identical.
 */
export default async function InstagramStrip() {
  const FEED = (await getGallery()).slice(0, 8);

  return (
    <section className="relative py-24 sm:py-32" aria-labelledby="instagram-title">
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="The daily feed"
            title="Follow the work."
            accent={[[2, 2]]}
            as="h2"
            size="display-md"
          />

          <Reveal y={16}>
            <a
              href={SITE.socials.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 font-sans text-2xs uppercase tracking-luxe text-ivory/55 transition-colors hover:text-accent"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line-2 transition-all duration-500 group-hover:border-accent/60">
                <FaInstagram className="h-4 w-4" aria-hidden="true" />
              </span>
              {SITE.socials.instagram.handle}
            </a>
          </Reveal>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-2 px-2 sm:grid-cols-4 lg:grid-cols-8">
        {FEED.map((item, i) => (
          <Reveal key={item.id} y={24} delay={(i % 4) * 0.05}>
            <a
              href={SITE.socials.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              className="group relative block overflow-hidden rounded-xl"
              aria-label={'View on Instagram: ' + item.title}
            >
              <Plate
                src={item.src}
                alt={item.title}
                theme={item.theme}
                index={item.index}
                ratio="aspect-square"
                rounded="rounded-xl"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                className="transition-transform duration-[1100ms] ease-luxe group-hover:scale-110"
              />
              <span className="on-media absolute inset-0 grid place-items-center bg-ink/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100">
                <FaInstagram className="h-5 w-5 text-accent" aria-hidden="true" />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
