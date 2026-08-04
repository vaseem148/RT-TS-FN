'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CountUp, Icon } from '@/components/ui/misc';

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'accent' | 'neutral';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  accent: 'bg-accent-soft text-accent',
  neutral: 'bg-surface-2 text-fg-muted',
};

export function StatCard({
  label,
  value,
  icon,
  tone = 'brand',
  suffix,
  prefix,
  decimals = 0,
  hint,
  href,
  className,
}: {
  label: string;
  value: number;
  icon: string;
  tone?: Tone;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  hint?: string;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid size-10 place-items-center rounded-xl', TONES[tone])}>
          <Icon name={icon} className="size-5" />
        </span>
        {hint && (
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10.5px] font-semibold text-fg-subtle">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-3.5 text-2xl font-extrabold tracking-tight text-fg sm:text-[1.75rem]">
        {prefix}
        <CountUp value={value} decimals={decimals} />
        {suffix}
      </p>
      <p className="mt-0.5 text-[12.5px] font-medium text-fg-muted">{label}</p>
    </>
  );

  const classes = cn(
    'rounded-2xl border border-line bg-surface p-4 transition-all duration-300',
    href && 'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/8',
    className
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
