import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-linear-135 from-brand to-accent shadow-lg shadow-brand/30 transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" aria-hidden>
          <path
            d="M4 18V7.5a2 2 0 0 1 2-2h5.5a3.75 3.75 0 0 1 1.6 7.14L17 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="6.5" r="2" fill="currentColor" />
        </svg>
        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-fg">Renderways</span>
          <span className="mt-0.5 text-[9.5px] font-semibold tracking-[0.18em] text-fg-subtle uppercase">
            Technology
          </span>
        </span>
      )}
    </Link>
  );
}
