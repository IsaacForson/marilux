'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  TEMPLATE_HINTS,
  TEMPLATE_LABELS,
  TEMPLATE_TOKENS,
  type TemplateKind,
  type TemplateSettings,
} from '@/lib/settings/types';
import { Panel, TextArea, TextInput, Toggle } from './Form';
import SaveBar from './SaveBar';

type Preview = {
  subject: string;
  text: string;
  sms: string;
  segments: number;
  unknownTokens: string[];
};

const KINDS: TemplateKind[] = ['received', 'confirmed', 'reminder', 'declined', 'cancelled'];

/**
 * Message template editor.
 *
 * Empty fields fall back to the copy we ship, which is the important
 * affordance: a studio can rewrite only the SMS and keep our email, and
 * clearing a field restores the default rather than sending nothing.
 */
export default function TemplateEditor({ initial }: { initial: TemplateSettings }) {
  const router = useRouter();
  const [draft, setDraft] = useState<TemplateSettings>(initial);
  const [kind, setKind] = useState<TemplateKind>('confirmed');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial],
  );

  const current = draft[kind];

  const patch = (p: Partial<typeof current>) => {
    setDraft((d) => ({ ...d, [kind]: { ...d[kind], ...p } }));
    setMessage(null);
    setError(null);
  };

  const refreshPreview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, ...draft[kind] }),
      });
      const data = await res.json();
      if (data.ok) setPreview(data);
    } catch {
      // A failed preview is not worth surfacing — the editor still works.
    }
  }, [kind, draft]);

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = window.setTimeout(refreshPreview, 400);
    return () => window.clearTimeout(id);
  }, [refreshPreview]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'templates', value: draft }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not save.');
      setMessage('Saved. New messages will use this wording.');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  const insert = (token: string) =>
    patch({ emailBody: (current.emailBody || '') + token });

  return (
    <div>
      {/* Which message */}
      <div className="no-scrollbar -mx-[var(--edge)] mb-6 flex gap-2 overflow-x-auto px-[var(--edge)]">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-current={kind === k ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full border px-5 py-2.5 font-sans text-2xs uppercase tracking-luxe transition-colors',
              kind === k
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-line text-ivory/45 hover:border-line-3 hover:text-ivory',
            )}
          >
            {TEMPLATE_LABELS[k]}
            {(draft[k].emailBody || draft[k].sms || draft[k].emailSubject) && (
              <span className="ml-2 text-accent">•</span>
            )}
          </button>
        ))}
      </div>

      <Panel title={TEMPLATE_LABELS[kind]} description={TEMPLATE_HINTS[kind]}>
        <Toggle
          label="Send this message"
          hint="Switch off and clients are not told about this event at all."
          checked={current.enabled}
          onChange={(enabled) => patch({ enabled })}
        />

        <div className="mt-6 space-y-6">
          <TextInput
            label="Email subject"
            hint="Leave blank to use our wording."
            placeholder="(using the default)"
            value={current.emailSubject}
            onChange={(e) => patch({ emailSubject: e.target.value })}
          />

          <TextArea
            label="Email message"
            hint="Leave blank to use our wording. Blank lines start a new paragraph."
            rows={9}
            placeholder="(using the default)"
            value={current.emailBody}
            onChange={(e) => patch({ emailBody: e.target.value })}
          />

          <div>
            <p className="eyebrow mb-2.5">Insert a detail</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_TOKENS.map((t) => (
                <button
                  key={t.token}
                  type="button"
                  onClick={() => insert(t.token)}
                  title={'Example: ' + t.hint}
                  className="rounded-lg border border-line px-2.5 py-1.5 font-mono text-[0.7rem] text-ivory/55 transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {t.token}
                </button>
              ))}
            </div>
          </div>

          <div>
            <TextArea
              label="Text message (SMS)"
              hint="Leave blank to use our wording. Keep it under 160 characters to stay at one segment."
              rows={4}
              placeholder="(using the default)"
              value={current.sms}
              onChange={(e) => patch({ sms: e.target.value })}
            />
            {preview && (
              <p
                className={cn(
                  'mt-2 text-right font-sans text-2xs uppercase tracking-luxe',
                  preview.segments > 1 ? 'text-warn' : 'text-ivory/35',
                )}
              >
                {preview.sms.length} characters ·{' '}
                {preview.segments === 1
                  ? '1 segment'
                  : preview.segments + ' segments — costs ' + preview.segments + '×'}
              </p>
            )}
          </div>
        </div>

        {preview && preview.unknownTokens.length > 0 && (
          <p className="mt-5 rounded-xl border border-warn/40 bg-warn/[0.07] p-4 text-sm text-ivory/70">
            These are not real placeholders and will be sent as written:{' '}
            {preview.unknownTokens.map((t) => '{{' + t + '}}').join(', ')}
          </p>
        )}
      </Panel>

      {/* Preview */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-6">
          <p className="eyebrow mb-4">Email preview</p>
          {preview ? (
            <>
              <p className="border-b border-line pb-3 text-sm text-ivory">
                <span className="text-ivory/35">Subject: </span>
                {preview.subject}
              </p>
              <pre className="mt-4 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ivory/65">
                {preview.text}
              </pre>
            </>
          ) : (
            <p className="text-sm text-ivory/30">Loading…</p>
          )}
        </div>

        <div className="rounded-2xl border border-line p-6">
          <p className="eyebrow mb-4">Text message preview</p>
          {preview ? (
            <div className="rounded-2xl rounded-bl-sm bg-fill-2 p-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ivory/80">
                {preview.sms}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-ivory/30">Loading…</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ivory/35">
            Previewed against a sample booking — Ama Owusu, Volume Set, Friday 18 September.
          </p>
        </div>
      </div>

      <SaveBar
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => setDraft(initial)}
        message={message}
        error={error}
      />
    </div>
  );
}
