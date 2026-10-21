import { cn } from '@/lib/utils';

export function Card({
  className,
  hover = false,
  glass = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean; glass?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line',
        glass ? 'glass' : 'bg-surface',
        hover &&
          'card-hover hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10 active:scale-[0.985]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 sm:p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-bold text-fg sm:text-lg', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm leading-relaxed text-fg-muted', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-line p-5 sm:px-6', className)}
      {...props}
    />
  );
}
