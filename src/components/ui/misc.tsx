'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { FALLBACK_ICON, ICONS } from './icon-registry';

/* -------------------------------- Icon -------------------------------- */

/** Renders a lucide icon by name, so icon choices can live in the database. */
export function Icon({
  name,
  className,
  fallback = 'Wrench',
}: {
  name?: string;
  className?: string;
  fallback?: string;
}) {
  const Component = (name && ICONS[name]) || ICONS[fallback] || FALLBACK_ICON;
  return <Component className={className} />;
}

/* ------------------------------- Avatar ------------------------------- */

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}: {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    xs: 'size-7 text-[10px]',
    sm: 'size-9 text-xs',
    md: 'size-11 text-sm',
    lg: 'size-14 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-linear-to-br from-brand/25 to-accent/25 font-bold text-fg',
        sizes[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name || ''} className="size-full object-cover" />
      ) : (
        initials(name)
      )}
    </span>
  );
}

/* ------------------------------ Skeleton ------------------------------ */

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn('skeleton rounded-lg', className)} style={style} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'size-6 animate-spin rounded-full border-2 border-line border-t-brand',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ----------------------------- Empty state ---------------------------- */

export function EmptyState({
  icon = 'Inbox',
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-16 text-center', className)}>
      <div className="grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-fg-subtle">
        <Icon name={icon} className="size-6" />
      </div>
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {description && <p className="max-w-sm text-sm text-fg-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* -------------------------- Scroll reveal ---------------------------- */

/**
 * Kept short and shallow on purpose: a long travel distance or duration makes
 * scrolling feel like it is waiting for the page to catch up.
 */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const REVEAL_TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

/** Triggers slightly before the element scrolls in, so it has already settled. */
const REVEAL_VIEWPORT = { once: true, margin: '0px 0px -80px 0px' };

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={revealVariants}
      transition={{ ...REVEAL_TRANSITION, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/** Staggers children that are themselves motion elements. */
export function RevealGroup({
  children,
  className,
  stagger = 0.04,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={revealVariants} transition={REVEAL_TRANSITION} className={className}>
      {children}
    </motion.div>
  );
}

/* --------------------------- Animated number -------------------------- */

export function CountUp({
  value,
  suffix = '',
  className,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  className?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  // Snappier than the default spring — the number should land in well under a
  // second rather than drifting while the user is already reading it.
  const spring = useSpring(motionValue, { damping: 30, stiffness: 220, restDelta: 0.5 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(
    () =>
      spring.on('change', (latest) => {
        setDisplay(
          decimals > 0
            ? latest.toFixed(decimals)
            : Math.round(latest).toLocaleString('en-IN')
        );
      }),
    [spring, decimals]
  );

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ------------------------------- Modal -------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface pb-(--safe-bottom) shadow-2xl sm:rounded-2xl sm:pb-0',
          widths[size]
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 p-5 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-fg">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-fg-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

/* ---------------------------- Section head ---------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-3xl text-3xl font-extrabold text-fg sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">{description}</p>
      )}
    </div>
  );
}

/* ---------------------------- Pagination ------------------------------ */

export function Pagination({
  page,
  pages,
  onChange,
  className,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (pages <= 1) return null;

  const window = 2;
  const items: (number | '…')[] = [];
  for (let i = 1; i <= pages; i += 1) {
    if (i === 1 || i === pages || Math.abs(i - page) <= window) items.push(i);
    else if (items[items.length - 1] !== '…') items.push('…');
  }

  return (
    <nav className={cn('flex items-center justify-center gap-1.5', className)} aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
      >
        Prev
      </button>
      {items.map((item, index) =>
        item === '…' ? (
          <span key={`gap-${index}`} className="px-1.5 text-fg-subtle">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors',
              item === page
                ? 'border-brand bg-brand text-brand-fg'
                : 'border-line text-fg-muted hover:border-brand hover:text-brand'
            )}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
