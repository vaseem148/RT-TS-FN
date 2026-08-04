import { cn } from '@/lib/utils';
import { PRIORITY_META, STATUS_META } from '@/lib/ticket-meta';
import type { TicketPriority, TicketStatus } from '@/lib/types';

export function Badge({
  className,
  dot,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { dot?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap',
        className
      )}
      {...props}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <Badge className={cn(meta.className, className)} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  const meta = PRIORITY_META[priority] ?? PRIORITY_META.medium;
  return (
    <Badge className={cn(meta.className, className)} dot={meta.dot}>
      {meta.label}
    </Badge>
  );
}
