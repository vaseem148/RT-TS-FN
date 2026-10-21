'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

interface CapacitorBridge {
  nativePromise?: (plugin: string, method: string, options: Record<string, string>) => Promise<unknown>;
}

/**
 * Keeps Android's status and navigation bar icons readable in the app.
 *
 * App headers are purple in both themes, so status bar icons are always light.
 * When the app draws edge to edge (Capacitor then injects a non-zero
 * --safe-area-inset-bottom) the tab bar sits under the gesture bar, so those
 * icons follow the theme; otherwise Android paints its own dark bar there.
 */
export function SystemBarsSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const call = (window as { Capacitor?: CapacitorBridge }).Capacitor?.nativePromise;
    if (!call || !resolvedTheme) return;

    const apply = () => {
      const inset = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')
      );
      const lightNavBar = inset > 0 && resolvedTheme !== 'dark';
      // Style names describe the bar background: DARK = light icons.
      call('SystemBars', 'setStyle', { bar: 'StatusBar', style: 'DARK' }).catch(() => {});
      call('SystemBars', 'setStyle', { bar: 'NavigationBar', style: lightNavBar ? 'LIGHT' : 'DARK' }).catch(
        () => {}
      );
    };

    apply();
    // Capacitor sets the inset variables on <html> once the page is laid out.
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null;
}
