import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/admin/auth';
import { dbConfigured } from '@/lib/store/db';
import {
  countUsers,
  createUser,
  deleteUser,
  findByEmail,
  listUsers,
  updateUser,
} from '@/lib/admin/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(10, 'Use at least 10 characters').max(200),
  role: z.enum(['owner', 'staff']).default('staff'),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().max(200).optional(),
  role: z.enum(['owner', 'staff']).optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    users: await listUsers(),
    me: session.user,
    bootstrap: session.bootstrap,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!dbConfigured()) {
    return NextResponse.json({ ok: false, error: 'A database is required.' }, { status: 503 });
  }

  // Only an owner may add people. The bootstrap session is allowed through
  // because it is how the very first account gets created.
  if (!session.bootstrap && session.user?.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Only an owner can add accounts.' },
      { status: 403 },
    );
  }

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid details.' },
      { status: 422 },
    );
  }

  if (await findByEmail(parsed.data.email)) {
    return NextResponse.json(
      { ok: false, error: 'An account already uses that email address.' },
      { status: 409 },
    );
  }

  // The first account is always the owner — otherwise a studio could lock
  // itself out of its own user management.
  const first = (await countUsers()) === 0;
  const user = await createUser({
    ...parsed.data,
    role: first ? 'owner' : parsed.data.role,
  });

  return NextResponse.json({ ok: true, user, users: await listUsers(), first });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid change.' }, { status: 422 });
  }

  const isSelf = session.user?.id === parsed.data.id;
  const isOwner = session.bootstrap || session.user?.role === 'owner';

  if (!isOwner && !isSelf) {
    return NextResponse.json(
      { ok: false, error: 'You can only change your own account.' },
      { status: 403 },
    );
  }
  // Nobody may promote themselves, and nobody may deactivate themselves —
  // both are routes to an unmanageable studio.
  if (isSelf && (parsed.data.role || parsed.data.isActive === false)) {
    return NextResponse.json(
      { ok: false, error: 'You cannot change your own role or deactivate yourself.' },
      { status: 422 },
    );
  }

  const guard = await guardLastOwner(parsed.data);
  if (guard) return guard;

  const user = await updateUser(parsed.data.id, parsed.data);
  return NextResponse.json({ ok: true, user, users: await listUsers() });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Not authorised.' }, { status: 401 });
  }
  if (!session.bootstrap && session.user?.role !== 'owner') {
    return NextResponse.json(
      { ok: false, error: 'Only an owner can remove accounts.' },
      { status: 403 },
    );
  }

  const id = new URL(req.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'No account specified.' }, { status: 422 });
  }
  if (session.user?.id === id) {
    return NextResponse.json(
      { ok: false, error: 'You cannot remove your own account.' },
      { status: 422 },
    );
  }

  const guard = await guardLastOwner({ id, isActive: false });
  if (guard) return guard;

  await deleteUser(id);
  return NextResponse.json({ ok: true, users: await listUsers() });
}

/** Refuses any change that would leave the studio with no active owner. */
async function guardLastOwner(change: { id: string; role?: string; isActive?: boolean }) {
  const demoting = change.role === 'staff' || change.isActive === false;
  if (!demoting) return null;

  const users = await listUsers();
  const target = users.find((u) => u.id === change.id);
  if (!target || target.role !== 'owner') return null;

  const otherOwners = users.filter(
    (u) => u.id !== change.id && u.role === 'owner' && u.isActive,
  );
  if (otherOwners.length > 0) return null;

  return NextResponse.json(
    { ok: false, error: 'This is the only owner. Make someone else an owner first.' },
    { status: 422 },
  );
}
