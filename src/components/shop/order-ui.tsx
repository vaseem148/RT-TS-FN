import { Check, X } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { cn, formatDateTime } from '@/lib/utils';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Where an admin may move an order next (mirrors the API). */
export const ORDER_NEXT: Record<OrderStatus, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const TONE: Record<OrderStatus, string> = {
  placed: 'border-info/30 bg-info-soft text-info',
  confirmed: 'border-accent/30 bg-accent-soft text-accent',
  out_for_delivery: 'border-warning/30 bg-warning-soft text-warning',
  delivered: 'border-success/30 bg-success-soft text-success',
  cancelled: 'border-line bg-surface-2 text-fg-muted',
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold',
        TONE[status],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

const STEPS: OrderStatus[] = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];

/** Placed → confirmed → out for delivery → delivered, with when each happened. */
export function OrderTimeline({ order }: { order: Order }) {
  const when = (status: OrderStatus) => order.history.find((entry) => entry.status === status)?.at;

  if (order.status === 'cancelled') {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-surface-2 p-3.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-danger text-white">
          <X className="size-4" />
        </span>
        <div>
          <p className="text-[14px] font-bold text-fg">Cancelled</p>
          <p className="text-[12.5px] text-fg-muted">{formatDateTime(order.cancelledAt ?? when('cancelled') ?? '')}</p>
        </div>
      </div>
    );
  }

  const reached = STEPS.indexOf(order.status);
  return (
    <ol className="space-y-0">
      {STEPS.map((step, index) => {
        const done = index <= reached;
        const at = when(step);
        return (
          <li key={step} className="flex gap-3">
            <div className="flex w-7 flex-col items-center">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-full border-2',
                  done ? 'border-brand bg-brand text-white' : 'border-line-strong bg-surface text-transparent'
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {index < STEPS.length - 1 && (
                <span className={cn('min-h-6 w-0.5 flex-1', index < reached ? 'bg-brand' : 'bg-line')} />
              )}
            </div>
            <div className="pb-4">
              <p className={cn('text-[14px] font-bold', done ? 'text-fg' : 'text-fg-subtle')}>
                {ORDER_STATUS_LABEL[step]}
              </p>
              {at && <p className="text-[12px] text-fg-muted">{formatDateTime(at)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
