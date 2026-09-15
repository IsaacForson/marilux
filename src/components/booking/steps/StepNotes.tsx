'use client';

import { useBooking } from '../BookingContext';
import Field from '../Field';

const PROMPTS = [
  'It is my first visit',
  'I am pregnant or breastfeeding',
  'I have sensitive skin',
  'I have an allergy to disclose',
  'I had a cosmetic procedure recently',
  'I am celebrating something',
  'I need to leave by a certain time',
];

export default function StepNotes() {
  const { draft, set } = useBooking();

  const append = (text: string) => {
    const current = draft.notes?.trim() ?? '';
    if (current.toLowerCase().includes(text.toLowerCase())) return;
    set({ notes: current ? current + '. ' + text : text });
  };

  return (
    <div>
      <Field
        label="Notes for your specialist"
        hint="Optional, but the more we know, the better we can prepare."
      >
        {(props) => (
          <textarea
            {...props}
            rows={6}
            maxLength={1000}
            placeholder="Allergies, pregnancy, skin sensitivities, medical conditions, recent cosmetic procedures, inspiration you want to bring — anything at all."
            value={draft.notes ?? ''}
            onChange={(e) => set({ notes: e.target.value })}
            className={props.className + ' resize-none leading-relaxed'}
          />
        )}
      </Field>

      <p className="mt-3 text-right font-sans text-2xs tracking-luxe text-ivory/25">
        {(draft.notes ?? '').length} / 1000
      </p>

      <p className="eyebrow mb-4 mt-8">Quick add</p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => append(p)}
            className="rounded-full border border-line px-4 py-2.5 text-sm text-ivory/60 transition-all duration-500 ease-luxe hover:border-accent/50 hover:text-accent"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-rosegold/20 bg-rosegold/[0.05] p-6">
        <p className="eyebrow mb-3 text-danger">Please tell us</p>
        <p className="max-w-[62ch] text-sm leading-relaxed text-ivory/60">
          Allergies, pregnancy, skin sensitivities, medical conditions, current medication and any
          cosmetic procedure in the last six weeks. Several of our pigments and actives are
          contraindicated — disclosing lets us adapt the protocol so you still get a result,
          safely.
        </p>
      </div>
    </div>
  );
}
