import 'server-only';
import type { BookingRecord, BookingStatus, DepositStatus } from '@/lib/booking/types';
import type { BookingRepository } from './types';
import { db } from './db';

/** Column list, with the date rendered as text so no timezone maths happens. */
const COLUMNS = `
  reference, name, email, phone, whatsapp,
  category_slug, category_name, service_slug, service_name,
  specialist_slug, specialist_name, duration_minutes,
  to_char(booking_date, 'YYYY-MM-DD') as booking_date,
  booking_time, price, deposit, deposit_status,
  payment_provider, payment_reference, status,
  notes, staff_note, policies_accepted,
  confirmation_sent_at, reminder_sent_at, created_at, updated_at
`;

type Row = {
  reference: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  category_slug: string;
  category_name: string;
  service_slug: string;
  service_name: string;
  specialist_slug: string;
  specialist_name: string;
  duration_minutes: number;
  booking_date: string;
  booking_time: number;
  price: number;
  deposit: number;
  deposit_status: DepositStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  status: BookingStatus;
  notes: string | null;
  staff_note: string | null;
  policies_accepted: boolean;
  confirmation_sent_at: Date | null;
  reminder_sent_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

const iso = (value: Date | null) => (value ? new Date(value).toISOString() : undefined);

function toRecord(row: Row): BookingRecord {
  return {
    reference: row.reference,
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    serviceSlug: row.service_slug,
    serviceName: row.service_name,
    specialistSlug: row.specialist_slug,
    specialistName: row.specialist_name,
    duration: row.duration_minutes,
    date: row.booking_date,
    time: row.booking_time,
    price: row.price,
    deposit: row.deposit,
    depositStatus: row.deposit_status,
    paymentProvider: row.payment_provider ?? undefined,
    paymentReference: row.payment_reference ?? undefined,
    status: row.status,
    notes: row.notes ?? undefined,
    staffNote: row.staff_note ?? undefined,
    policiesAccepted: true,
    confirmationSentAt: iso(row.confirmation_sent_at),
    reminderSentAt: iso(row.reminder_sent_at),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/** Only these may be patched, and each maps to exactly one column. */
const PATCHABLE: Record<string, string> = {
  status: 'status',
  depositStatus: 'deposit_status',
  staffNote: 'staff_note',
  paymentProvider: 'payment_provider',
  paymentReference: 'payment_reference',
  confirmationSentAt: 'confirmation_sent_at',
  reminderSentAt: 'reminder_sent_at',
  notes: 'notes',
};

export const postgresRepository: BookingRepository = {
  async all() {
    const sql = db();
    const rows = await sql.unsafe<Row[]>(
      'select ' + COLUMNS + ' from public.bookings order by created_at desc',
    );
    return rows.map(toRecord);
  },

  async find(reference) {
    const sql = db();
    const rows = await sql.unsafe<Row[]>(
      'select ' + COLUMNS + ' from public.bookings where reference = $1',
      [reference],
    );
    return rows[0] ? toRecord(rows[0]) : undefined;
  },

  async create(record) {
    const sql = db();
    await sql`
      insert into public.bookings (
        reference, name, email, phone, whatsapp,
        category_slug, category_name, service_slug, service_name,
        specialist_slug, specialist_name, duration_minutes,
        booking_date, booking_time, price, deposit, deposit_status,
        status, notes, policies_accepted, created_at, updated_at
      ) values (
        ${record.reference}, ${record.name}, ${record.email},
        ${record.phone}, ${record.whatsapp},
        ${record.categorySlug}, ${record.categoryName},
        ${record.serviceSlug}, ${record.serviceName},
        ${record.specialistSlug}, ${record.specialistName}, ${record.duration},
        ${record.date}::date, ${record.time},
        ${record.price}, ${record.deposit}, ${record.depositStatus},
        ${record.status}, ${record.notes ?? null}, ${record.policiesAccepted},
        ${record.createdAt}, ${record.updatedAt}
      )`;
    return record;
  },

  async update(reference, patch) {
    const sql = db();

    const assignments: string[] = [];
    const values: Array<string | number | boolean | null> = [];
    for (const [key, column] of Object.entries(PATCHABLE)) {
      const value = (patch as Record<string, unknown>)[key];
      if (value === undefined) continue;
      values.push(value as string | number | boolean | null);
      assignments.push(column + ' = $' + (values.length + 1));
    }

    if (assignments.length === 0) return this.find(reference);

    const rows = await sql.unsafe<Row[]>(
      'update public.bookings set ' +
        assignments.join(', ') +
        ' where reference = $1 returning ' +
        COLUMNS,
      [reference, ...values],
    );
    return rows[0] ? toRecord(rows[0]) : undefined;
  },

  async activeOn(isoDate) {
    const sql = db();
    const rows = await sql.unsafe<Row[]>(
      'select ' +
        COLUMNS +
        " from public.bookings where booking_date = $1::date and status in ('pending','confirmed')",
      [isoDate],
    );
    return rows.map(toRecord);
  },
};
