'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

interface CapacitorBridge {
  nativePromise?: (
    plugin: string,
    method: string,
    options: Record<string, string | boolean>
  ) => Promise<unknown>;
}

/**
 * Matches Android's status and navigation bars to the app: purple behind the
 * status bar (every app screen starts with the purple header) and the tab bar
 * colour behind the navigation bar, with icons that stay readable.
 *
 * The AppBars plugin ships with app 1.0.2. Older installs only have
 * SystemBars, which can set icon colours but not bar colours.
 */
export function SystemBarsSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const call = (window as { Capacitor?: CapacitorBridge }).Capacitor?.nativePromise;
    if (!call || !resolvedTheme) return;
    const isDark = resolvedTheme === 'dark';

    const apply = () => {
      const styles = getComputedStyle(document.documentElement);
      call('AppBars', 'setColors', {
        top: styles.getPropertyValue('--hero').trim(),
        bottom: styles.getPropertyValue('--surface').trim(),
        darkStatusIcons: false,
        darkNavIcons: !isDark,
      }).catch(() => {
        // Edge to edge (Capacitor injects a non-zero inset) the tab bar sits under
        // the gesture bar, so its icons follow the theme; otherwise the bar is dark.
        const inset = parseFloat(styles.getPropertyValue('--safe-area-inset-bottom'));
        call('SystemBars', 'setStyle', { bar: 'StatusBar', style: 'DARK' }).catch(() => {});
        call('SystemBars', 'setStyle', {
          bar: 'NavigationBar',
          style: inset > 0 && !isDark ? 'LIGHT' : 'DARK',
        }).catch(() => {});
      });
    };

    apply();
    // Capacitor sets the inset variables on <html> once the page is laid out,
    // and resets the bars itself on rotation or a system theme change.
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener('change', apply);
    window.addEventListener('resize', apply);
    document.addEventListener('visibilitychange', apply);
    return () => {
      observer.disconnect();
      systemTheme.removeEventListener('change', apply);
      window.removeEventListener('resize', apply);
      document.removeEventListener('visibilitychange', apply);
    };
  }, [resolvedTheme]);

  return null;
}
