'use client';

import { usePathname } from 'next/navigation';

/**
 * Plays the page entrance on every route change. A template.tsx alone only
 * re-mounts when its direct child segment changes, so /portal/tickets →
 * /portal/tickets/123 would not animate; keying on the pathname covers that.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
