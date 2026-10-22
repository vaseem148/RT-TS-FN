'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsApp } from '@/lib/app-mode';
import { homeFor, useAuth } from './auth-provider';

/** What a signed-out app user can open: the welcome, sign-in and sign-up flow, and the legal pages it links to. */
export const APP_OPEN_PATHS = ['/welcome', '/login', '/register', '/privacy', '/terms'];
export const APP_AUTH_SCREENS = ['/welcome', '/login', '/register'];

/** Set once someone has signed in on this phone: from then on, signed out means the sign-in screen. */
const WELCOMED_KEY = 'rw_welcomed';

/** Where a signed-in app user belongs: customers on the app home, staff on their dashboards. */
export function appHomeFor(role?: string) {
  return role === 'customer' ? '/' : homeFor(role);
}

/**
 * The app starts with an account. Signed out, every screen except the
 * welcome / sign-in / sign-up flow sends you there first — the welcome slides
 * on a new install, the sign-in screen after that. Signed in, those screens
 * send you home. The website is untouched.
 */
export function AppGate() {
  const isApp = useIsApp();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isApp || loading) return;

    let target: string | null = null;
    if (user) {
      try {
        localStorage.setItem(WELCOMED_KEY, '1');
      } catch {
        /* storage blocked: the welcome slides show again next time */
      }
      if (APP_AUTH_SCREENS.includes(pathname)) {
        // Sign-in can carry ?next= back to where it was asked for.
        const next = new URLSearchParams(window.location.search).get('next');
        target = next && /^\/(?![/\\])/.test(next) ? next : appHomeFor(user.role);
      }
    } else if (!APP_OPEN_PATHS.includes(pathname)) {
      let welcomed = false;
      try {
        welcomed = localStorage.getItem(WELCOMED_KEY) === '1';
      } catch {
        /* treat as a new install */
      }
      target = welcomed ? '/login' : '/welcome';
    }

    if (target) router.replace(target);
    else document.documentElement.classList.remove('rw-gate');
  }, [isApp, loading, user, pathname, router]);

  return null;
}
