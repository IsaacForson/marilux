import Link from 'next/link';
import { SERVICE_CATEGORIES } from '@/lib/data/services';
import { ButtonLink } from '@/components/ui/Button';
import Aura from '@/components/ui/Aura';

export const metadata = {
  title: 'Page not found — Marilux Beauty Bar',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden py-32">
      <Aura className="left-1/2 top-1/3 -translate-x-1/2" color="rgba(217,188,140,0.15)" size={640} />

      <div className="shell relative mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-7">Error 404</p>

        <h1 className="display-lg">
          This room does not <span className="gold-text">exist</span>.
        </h1>

        <p className="lede mx-auto mt-7 max-w-[46ch]">
          The page you were looking for has moved or was never here. Everything else is exactly
          where you left it.
        </p>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/" size="lg" magnetic arrow>
            Back to the house
          </ButtonLink>
          <ButtonLink href="/booking" variant="outline" size="lg">
            Book an appointment
          </ButtonLink>
        </div>

        <div className="mt-16">
          <p className="eyebrow mb-5">Or step into</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SERVICE_CATEGORIES.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={'/services/' + c.slug}
                className="rounded-full border border-white/[0.09] px-4 py-2.5 font-sans text-2xs uppercase tracking-luxe text-ivory/50 transition-all duration-500 hover:border-champagne/50 hover:text-champagne"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
