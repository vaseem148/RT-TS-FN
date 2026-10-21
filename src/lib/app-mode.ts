'use client';

import { useSyncExternalStore } from 'react';

/** True when <html> carries the `app` class set by APP_MODE_SCRIPT. */
export function isAppMode() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('app');
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** False during SSR and hydration, then the real value — safe to branch on. */
export function useIsApp() {
  return useSyncExternalStore(subscribe, isAppMode, () => false);
}
