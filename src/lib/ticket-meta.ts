import type { TicketPriority, TicketStatus } from './types';

interface Meta {
  label: string;
  /** Tailwind classes for the pill: text, background, border. */
  className: string;
  dot: string;
}

export const STATUS_META: Record<TicketStatus, Meta> = {
  open: {
    label: 'Open',
    className: 'text-info bg-info-soft border-info/25',
    dot: 'bg-info',
  },
  assigned: {
    label: 'Assigned',
    className: 'text-accent bg-accent-soft border-accent/25',
    dot: 'bg-accent',
  },
  in_progress: {
    label: 'In progress',
    className: 'text-brand bg-brand-soft border-brand/25',
    dot: 'bg-brand',
  },
  awaiting_customer: {
    label: 'Awaiting you',
    className: 'text-warning bg-warning-soft border-warning/25',
    dot: 'bg-warning',
  },
  resolved: {
    label: 'Resolved',
    className: 'text-success bg-success-soft border-success/25',
    dot: 'bg-success',
  },
  closed: {
    label: 'Closed',
    className: 'text-fg-muted bg-surface-2 border-line',
    dot: 'bg-fg-subtle',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'text-danger bg-danger-soft border-danger/25',
    dot: 'bg-danger',
  },
};

export const PRIORITY_META: Record<TicketPriority, Meta> = {
  low: { label: 'Low', className: 'text-fg-muted bg-surface-2 border-line', dot: 'bg-fg-subtle' },
  medium: { label: 'Medium', className: 'text-info bg-info-soft border-info/25', dot: 'bg-info' },
  high: {
    label: 'High',
    className: 'text-warning bg-warning-soft border-warning/25',
    dot: 'bg-warning',
  },
  urgent: {
    label: 'Urgent',
    className: 'text-danger bg-danger-soft border-danger/25',
    dot: 'bg-danger',
  },
};

/** Category value → the lucide icon name used to represent it. */
export const CATEGORY_ICON: Record<string, string> = {
  'computer-repair': 'Monitor',
  'laptop-repair': 'Laptop',
  'chip-level-service': 'Cpu',
  'board-level-service': 'CircuitBoard',
  'cctv-installation': 'Cctv',
  'cctv-service': 'Video',
  'data-recovery': 'DatabaseBackup',
  'spare-parts': 'HardDrive',
  rental: 'PackageOpen',
  networking: 'Network',
  amc: 'ShieldCheck',
  other: 'Wrench',
};

export const SERVICE_MODE_LABEL: Record<string, string> = {
  onsite: 'On-site visit',
  'carry-in': 'I will bring it in',
  remote: 'Remote support',
  'pickup-drop': 'Pickup & drop',
};

/**
 * The status a given role is allowed to move a ticket into, keyed by the
 * ticket's current status. Mirrors the rules enforced by the API.
 */
export function allowedTransitions(current: TicketStatus, role: string): TicketStatus[] {
  if (role === 'customer') {
    if (current === 'open' || current === 'assigned') return ['cancelled'];
    if (current === 'resolved') return ['closed'];
    if (current === 'awaiting_customer') return ['in_progress'];
    return [];
  }

  const staffFlow: Record<TicketStatus, TicketStatus[]> = {
    open: ['assigned', 'in_progress', 'cancelled'],
    assigned: ['in_progress', 'awaiting_customer', 'cancelled'],
    in_progress: ['awaiting_customer', 'resolved', 'cancelled'],
    awaiting_customer: ['in_progress', 'resolved', 'cancelled'],
    resolved: ['closed', 'in_progress'],
    closed: ['in_progress'],
    cancelled: ['open'],
  };

  return staffFlow[current] ?? [];
}
