import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, { compact = false } = {}) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...(compact ? { notation: 'compact' } : {}),
  }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export function formatDate(value?: string | Date | null, pattern = 'd MMM yyyy') {
  if (!value) return '—';
  const date = new Date(value);
  return isValid(date) ? format(date, pattern) : '—';
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, "d MMM yyyy 'at' h:mm a");
}

export function timeAgo(value?: string | Date | null) {
  if (!value) return '—';
  const date = new Date(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

/** Human-readable countdown to (or overshoot past) an SLA deadline. */
export function slaLabel(dueAt?: string | Date | null) {
  if (!dueAt) return null;
  const due = new Date(dueAt).getTime();
  if (Number.isNaN(due)) return null;

  const diffMs = due - Date.now();
  const overdue = diffMs < 0;
  const hours = Math.floor(Math.abs(diffMs) / 3_600_000);
  const minutes = Math.floor((Math.abs(diffMs) % 3_600_000) / 60_000);

  const span =
    hours >= 24
      ? `${Math.floor(hours / 24)}d ${hours % 24}h`
      : hours >= 1
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;

  return { overdue, text: overdue ? `${span} overdue` : `${span} left` };
}

export function initials(name?: string) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Converts an enum value like `chip-level_service` into "Chip level service". */
export function titleCase(value?: string) {
  if (!value) return '';
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bCctv\b/g, 'CCTV')
    .replace(/\bAmc\b/g, 'AMC')
    .replace(/\bIt\b/g, 'IT')
    .replace(/\bSla\b/g, 'SLA');
}

export function absoluteUrl(path?: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function truncate(value: string, max = 120) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}
