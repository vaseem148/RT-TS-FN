'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './auth-provider';
import { SystemBarsSync } from './system-bars-sync';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        {children}
        <SystemBarsSync />
        <Toaster
          position="top-center"
          // Clear of the status bar when the app draws edge to edge.
          containerStyle={{ top: 'calc(var(--safe-top) + 16px)' }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 18px 40px -14px rgba(2, 6, 23, 0.4)',
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--surface)' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: 'var(--surface)' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
