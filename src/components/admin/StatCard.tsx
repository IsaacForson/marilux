import { cn } from '@/lib/utils';

export default function StatCard({
  label,
  value,
  hint,
  accent,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6',
        accent ? 'border-accent/30 bg-accent/[0.06]' : 'border-line bg-fill',
        className,
      )}
    >
      <p className="font-sans text-2xs uppercase tracking-luxe text-ivory/40">{label}</p>
      <p
        className={cn(
          'mt-3 font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-none tabular-nums',
          accent ? 'text-accent' : 'text-ivory',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2.5 text-xs leading-relaxed text-ivory/35">{hint}</p>}
    </div>
  );
}
