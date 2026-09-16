import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isSignedIn } from '@/lib/admin/auth';
import { dbConfigured } from '@/lib/store/db';
import { deletePromotion, listPromotions, upsertPromotion } from '@/lib/catalogue/promotions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z
  .object({
    id: z.string().uuid().optional(),
    code: z.string().trim().max(40).nullable().optional(),
    label: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).nullable().optional(),
    kind: z.enum(['percent', 'amount']),
    value: z.number().int().positive(),
    scope: z.enum(['all', 'category', 'service']),
    scopeValue: z.string().trim().max(120).nullable().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    minSpend: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .refine((v) => v.kind !== 'percent' || v.value <= 100, {
    message: 'A percentage discount cannot exceed 100.',
    path: ['value'],
  })
  .refine((v) => v.scope === 'all' || Boolean(v.scopeValue), {
    message: 'Choose what this applies to.',
    path: ['scopeValue'],
  });

export async function GET() {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, promotions: await listPromotions() });
}

export async function PUT(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'A database is required. Set DATABASE_URL.' },
      { status: 503 },
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid promotion.' },
      { status: 422 },
    );
  }

  try {
    const promotion = await upsertPromotion({
      ...parsed.data,
      code: parsed.data.code ?? null,
      description: parsed.data.description ?? null,
      scopeValue: parsed.data.scopeValue ?? null,
      startsAt: parsed.data.startsAt || null,
      endsAt: parsed.data.endsAt || null,
      maxUses: parsed.data.maxUses ?? null,
    });
    revalidatePath('/');
    revalidatePath('/services');
    revalidatePath('/booking');
    return NextResponse.json({ ok: true, promotion, promotions: await listPromotions() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    // A duplicate coupon code is the one error worth naming precisely.
    const friendly = /unique|duplicate/i.test(detail)
      ? 'That code is already in use.'
      : 'Could not save that promotion.';
    console.error('[promotions] save failed:', error);
    return NextResponse.json({ ok: false, error: friendly }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isSignedIn())) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'No promotion specified.' }, { status: 422 });
  }
  await deletePromotion(id);
  revalidatePath('/');
  revalidatePath('/services');
  return NextResponse.json({ ok: true, promotions: await listPromotions() });
}
