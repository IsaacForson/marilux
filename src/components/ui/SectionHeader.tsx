import { cn } from '@/lib/utils';
import Reveal from './Reveal';
import SplitHeading from './SplitHeading';

export default function SectionHeader({
  eyebrow,
  title,
  accent,
  lede,
  align = 'left',
  className,
  as = 'h2',
  size = 'display-lg',
}: {
  eyebrow?: string;
  title: string;
  accent?: Array<[number, number]>;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  size?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow && (
        <Reveal y={14} duration={0.7}>
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-champagne/45" aria-hidden="true" />
            <span className="eyebrow">{eyebrow}</span>
          </div>
        </Reveal>
      )}

      <SplitHeading as={as} text={title} accent={accent} className={cn(size, 'max-w-[16ch]')} />

      {lede && (
        <Reveal y={20} delay={0.12}>
          <p className={cn('lede mt-6 max-w-[54ch]', align === 'center' && 'mx-auto')}>{lede}</p>
        </Reveal>
      )}
    </div>
  );
}
