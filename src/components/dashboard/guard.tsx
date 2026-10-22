'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { Spinner } from '@/components/ui/misc';

/**
 * Blocks rendering until the session is known, then redirects anyone who is
 * signed out (to /login) or in the wrong area (to their own dashboard).
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // Signing out empties `user` while still on this page; the sign-out moves on
  // by itself, and a second redirect here would race it.
  const hadUser = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user) hadUser.current = true;
    if (!user) {
      if (hadUser.current) return;
      // Keep the query too, so a "Book a slot" pick survives signing in.
      router.replace(`/login?next=${encodeURIComponent(pathname + window.location.search)}`);
      return;
    }
    if (!roles.includes(user.role)) router.replace(homeFor(user.role));
  }, [user, loading, roles, router, pathname]);

  if (loading || !user || !roles.includes(user.role)) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-[13px] text-fg-muted">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
