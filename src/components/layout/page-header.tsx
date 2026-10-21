import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    // In the app this becomes the purple app header (see .app-hero).
    <section
      className={cn('app-hero relative isolate overflow-hidden border-b border-line app:border-b-0', className)}
    >
      <div className="aurora opacity-70 app:hidden" aria-hidden />
      <div className="absolute inset-0 -z-10 grid-bg app:hidden" aria-hidden />
      <span
        className="absolute top-6 -right-24 -z-10 hidden size-56 rounded-full bg-white/[0.07] app:block"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 app:pt-2 app:pb-8">
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[12.5px] app:hidden">
            <Link href="/" className="text-fg-subtle transition-colors hover:text-brand">
              Home
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5 text-fg-subtle" />
                {crumb.href ? (
                  <Link href={crumb.href} className="text-fg-subtle transition-colors hover:text-brand">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-fg">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-brand uppercase app:hidden">
            {eyebrow}
          </span>
        )}

        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-fg sm:text-5xl app:mt-0 app:text-[1.65rem] app:leading-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-fg-muted app:mt-2 app:text-[14px]">{description}</p>
        )}

        {children && <div className="mt-7 app:mt-5">{children}</div>}
      </div>
    </section>
  );
}
