import { STATUS_LABEL, type BookingStatus, type DepositStatus } from '@/lib/booking/types';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: 'border-warn/45 text-warn bg-warn/10',
  confirmed: 'border-success/45 text-success bg-success/10',
  completed: 'border-accent/45 text-accent bg-accent/10',
  declined: 'border-danger/40 text-danger bg-danger/10',
  cancelled: 'border-line-3 text-ivory/45',
  'no-show': 'border-danger/40 text-danger bg-danger/10',
};

export function StatusPill({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe',
        STATUS_STYLE[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const DEPOSIT_STYLE: Record<DepositStatus, string> = {
  paid: 'border-success/45 text-success bg-success/10',
  pending: 'border-warn/45 text-warn bg-warn/10',
  'awaiting-link': 'border-warn/45 text-warn bg-warn/10',
  refunded: 'border-line-3 text-ivory/45',
  failed: 'border-danger/40 text-danger bg-danger/10',
};

const DEPOSIT_LABEL: Record<DepositStatus, string> = {
  paid: 'Deposit paid',
  pending: 'Deposit pending',
  'awaiting-link': 'Link to send',
  refunded: 'Refunded',
  failed: 'Payment failed',
};

export function DepositPill({
  status,
  className,
}: {
  status: DepositStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 font-sans text-2xs uppercase tracking-luxe',
        DEPOSIT_STYLE[status],
        className,
      )}
    >
      {DEPOSIT_LABEL[status]}
    </span>
  );
}
