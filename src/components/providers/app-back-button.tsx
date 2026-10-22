'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { appHomeFor } from './app-gate';
import { useAuth } from './auth-provider';

interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  addListener?: (
    plugin: string,
    event: string,
    callback: (data?: { canGoBack?: boolean } | null) => void
  ) => { remove: () => Promise<void> };
  nativePromise?: (plugin: string, method: string, options: Record<string, never>) => Promise<unknown>;
}

/**
 * Android's Back button in the app. Capacitor's default goes back through the
 * WebView history and then does nothing, so Back could never leave the app.
 * Here Back:
 * - closes an open dialog or menu first;
 * - on Home (a staff member's dashboard) or the welcome screen, closes the
 *   app, like any app's home;
 * - signed out on sign-in or sign-up, returns to the welcome screen instead of
 *   walking back into the screens of whoever just signed out;
 * - anywhere else goes back, or closes the app when there is nowhere to go.
 */
export function AppBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Registered once; the handler reads the current values from here.
  const home = user ? appHomeFor(user.role) : null;
  const latest = useRef({ pathname, router, home });
  latest.current = { pathname, router, home };

  useEffect(() => {
    const cap = (window as { Capacitor?: CapacitorBridge }).Capacitor;
    if (!cap?.isNativePlatform?.() || !cap.addListener || !cap.nativePromise) return;
    const exit = cap.nativePromise;

    const listener = cap.addListener('App', 'backButton', (data) => {
      const { pathname, router, home } = latest.current;

      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } else if (pathname === '/' || pathname === '/welcome' || pathname === home || !data?.canGoBack) {
        exit('App', 'exitApp', {}).catch(() => {});
      } else if (!home && (pathname === '/login' || pathname === '/register')) {
        router.replace('/welcome');
      } else {
        window.history.back();
      }
    });
    return () => void listener.remove();
  }, []);

  return null;
}
