'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glass';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-brand-fg hover:brightness-110 shadow-lg shadow-brand/25 hover:shadow-brand/40 active:scale-[0.98]',
  secondary:
    'bg-surface-2 text-fg border border-line hover:border-brand/45 hover:bg-surface active:scale-[0.98]',
  outline:
    'border border-line-strong text-fg hover:border-brand hover:text-brand hover:bg-brand-soft/45 active:scale-[0.98]',
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white hover:brightness-110 shadow-lg shadow-danger/25 active:scale-[0.98]',
  success:
    'bg-success text-white hover:brightness-110 shadow-lg shadow-success/25 active:scale-[0.98]',
  glass: 'glass border border-line text-fg hover:border-brand/45 active:scale-[0.98]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-10 w-10 rounded-lg justify-center',
};

const BASE =
  'inline-flex items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | AnchorProps>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, ...props },
  ref
) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if ('href' in props && props.href) {
    const { href, ...rest } = props as AnchorProps;
    const external = /^(https?:|tel:|mailto:)/.test(href);

    if (external) {
      return (
        <a
          href={href}
          className={classes}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { disabled, ...rest } = props as ButtonProps;
  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
