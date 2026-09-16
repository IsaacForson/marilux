import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { getSetting, resetSetting, setSetting } from '@/lib/settings/store';
import type { SettingsKey } from '@/lib/settings/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const KEYS = ['notifications', 'templates', 'booking', 'banner'] as const;

const schema = z.object({
  key: z.enum(KEYS),
  value: z.record(z.unknown()),
});

/** The banner lives in the public layout, so a layout revalidation covers every page. */
function revalidateSite() {
  revalidatePath('/', 'layout');
}

export async function GET(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const key = new URL(req.url).searchParams.get('key') as SettingsKey | null;
  if (!key || !KEYS.includes(key as (typeof KEYS)[number])) {
    return NextResponse.json({ ok: false, error: 'Unknown settings key.' }, { status: 422 });
  }
  return NextResponse.json({ ok: true, value: await getSetting(key) });
}

export async function PUT(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid settings payload.' }, { status: 422 });
  }

  try {
    const value = await setSetting(
      parsed.data.key,
      parsed.data.value as Parameters<typeof setSetting>[1],
    );
    revalidateSite();
    return NextResponse.json({ ok: true, value });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not save.' },
      { status: 500 },
    );
  }
}

/** Restore one group to the shipped defaults. */
export async function DELETE(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const key = new URL(req.url).searchParams.get('key') as SettingsKey | null;
  if (!key || !KEYS.includes(key as (typeof KEYS)[number])) {
    return NextResponse.json({ ok: false, error: 'Unknown settings key.' }, { status: 422 });
  }
  await resetSetting(key);
  revalidateSite();
  return NextResponse.json({ ok: true, value: await getSetting(key) });
}
