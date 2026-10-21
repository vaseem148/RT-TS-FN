import type { Metadata, Viewport } from 'next';
import { site } from '@/lib/site';
import { APP_MODE_SCRIPT } from '@/lib/app-mode-script';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — IT Solutions, CCTV & Service Ticketing in Chennai`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    'computer service Chennai',
    'laptop repair Chennai',
    'chip level service',
    'CCTV installation Chennai',
    'data recovery Chennai',
    'laptop rental Chennai',
    'IT AMC Chennai',
    'Renderways Technology',
  ],
  authors: [{ name: site.name }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#05070e' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior tells Next.js to keep our CSS smooth scrolling
    // instead of disabling it during route transitions.
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Runs before first paint so the Android app never flashes the website chrome. */}
        <script dangerouslySetInnerHTML={{ __html: APP_MODE_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
