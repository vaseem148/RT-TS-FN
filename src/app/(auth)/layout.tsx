import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Clock, Headset } from 'lucide-react';
import { site } from '@/lib/site';
import { Logo } from '@/components/layout/logo';
import { ThemeToggle } from '@/components/layout/theme-toggle';

const HIGHLIGHTS = [
  { icon: Clock, title: 'Live ticket tracking', body: 'Watch every step from raise to sign-off.' },
  { icon: Headset, title: 'One team, one number', body: '24/7 emergency line, real technicians.' },
  { icon: BadgeCheck, title: '30-day warranty', body: 'Written into every repair we close.' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden border-r border-line bg-bg-subtle p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="aurora" aria-hidden />
        <div className="absolute inset-0 grid-bg" aria-hidden />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          <h2 className="max-w-md text-4xl leading-[1.12] font-extrabold tracking-tight text-fg">
            Your repairs,{' '}
            <span className="text-gradient">visible from start to finish.</span>
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-fg-muted">
            {site.tagline}. Sign in to raise tickets, follow technicians in real time and keep every
            invoice in one place.
          </p>

          <ul className="mt-10 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <p className="text-[14.5px] font-bold text-fg">{item.title}</p>
                  <p className="text-[13px] text-fg-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12.5px] text-fg-subtle">
          © {new Date().getFullYear()} {site.name} · Chennai &amp; Vellore
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col">
        <div className="app-hero flex items-center justify-between p-5 sm:p-6 app:pt-[calc(var(--safe-top)+0.75rem)] app:pb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:text-brand"
          >
            <ArrowLeft className="size-4" />
            <span className="app:hidden">Back to website</span>
            <span className="hidden app:inline">Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="lg:hidden">
              <Logo compact />
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-5 pb-14 sm:p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
