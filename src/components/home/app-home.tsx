'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  Info,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import { serviceApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { useIsApp } from '@/lib/app-mode';
import { formatCurrency } from '@/lib/utils';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Icon, Skeleton, Spinner } from '@/components/ui/misc';

const ACTIONS = [
  { label: 'Raise ticket', href: '/portal/tickets/new', icon: Ticket, tone: 'bg-brand-soft text-brand' },
  { label: 'Track', href: '/track', icon: Search, tone: 'bg-accent-soft text-accent' },
  { label: 'Call us', href: `tel:${site.primaryPhone}`, icon: Phone, tone: 'bg-success-soft text-success' },
  { label: 'WhatsApp', href: whatsappLink(), icon: MessageCircle, tone: 'bg-success-soft text-success' },
];

const MORE = [
  { label: 'Products', href: '/products', icon: Package },
  { label: 'About us', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
  { label: 'Privacy policy', href: '/privacy', icon: ShieldCheck },
  { label: 'Terms of service', href: '/terms', icon: FileText },
];

const isExternal = (href: string) => !href.startsWith('/');

/**
 * Home screen of the Android app (the website keeps its marketing home page).
 * Signed-in users skip it and land on their own dashboard.
 */
export function AppHome() {
  const isApp = useIsApp();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ticketNumber, setTicketNumber] = useState('');
  const { data: services } = useApi('services', () => serviceApi.list(), { ttl: 300_000 });

  useEffect(() => {
    if (isApp && user) router.replace(homeFor(user.role));
  }, [isApp, user, router]);

  const track = (event: React.FormEvent) => {
    event.preventDefault();
    const value = ticketNumber.trim().toUpperCase();
    if (value) router.push(`/track?t=${encodeURIComponent(value)}`);
  };

  if (loading || user) {
    return (
      <div className="grid min-h-[60dvh] place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="stagger mx-auto max-w-lg space-y-6 px-4 pt-4 pb-6">
      {/* Greeting + quick track */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-linear-135 from-brand to-accent p-5 text-white shadow-xl shadow-brand/25">
        <span className="absolute -top-10 -right-8 -z-10 size-36 rounded-full bg-white/15" aria-hidden />
        <span className="absolute -bottom-14 left-1/3 -z-10 size-32 rounded-full bg-white/10" aria-hidden />

        <p className="text-[13px] font-semibold text-white/80">Welcome to {site.shortName}</p>
        <h1 className="mt-1 text-[1.6rem] leading-tight font-extrabold tracking-tight">
          How can we help today?
        </h1>

        <form
          onSubmit={track}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 p-1.5 ring-1 ring-white/25 backdrop-blur"
        >
          <Search className="ml-2 size-4 shrink-0 text-white/80" />
          <input
            value={ticketNumber}
            onChange={(event) => setTicketNumber(event.target.value)}
            placeholder="Ticket no. e.g. RW-2026-0184"
            aria-label="Ticket number"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/65"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-3.5 py-2 text-[13px] font-bold text-brand transition-transform active:scale-95"
          >
            Track
          </button>
        </form>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-2">
        {ACTIONS.map((action) => {
          const content = (
            <>
              <span className={`grid size-13 place-items-center rounded-2xl ${action.tone}`}>
                <action.icon className="size-6" />
              </span>
              <span className="text-center text-[11.5px] leading-tight font-semibold text-fg">
                {action.label}
              </span>
            </>
          );
          const className = 'flex flex-col items-center gap-1.5 transition-transform active:scale-90';

          return isExternal(action.href) ? (
            <a key={action.label} href={action.href} className={className}>
              {content}
            </a>
          ) : (
            <Link key={action.label} href={action.href} className={className}>
              {content}
            </Link>
          );
        })}
      </section>

      {/* Services */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-[17px] font-bold tracking-tight text-fg">Services</h2>
          <Link href="/services" className="text-[13px] font-bold text-brand">
            See all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {!services
            ? Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))
            : services.slice(0, 6).map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="flex flex-col rounded-2xl border border-line bg-surface p-3.5 transition-transform active:scale-[0.97]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand">
                    <Icon name={service.icon} className="size-5" />
                  </span>
                  <span className="mt-2.5 line-clamp-2 text-[13.5px] leading-snug font-bold text-fg">
                    {service.title}
                  </span>
                  <span className="mt-auto pt-1.5 text-[12px] text-fg-subtle">
                    From{' '}
                    <span className="font-bold text-fg">{formatCurrency(service.startingPrice)}</span>
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* Sign in */}
      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-[16px] font-bold text-fg">Your tickets, in your pocket</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">
          Sign in to raise tickets, follow your technician live and keep every invoice in one place.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button href="/login" className="rounded-2xl">
            Sign in
          </Button>
          <Button href="/register" variant="secondary" className="rounded-2xl">
            Create account
          </Button>
        </div>
      </section>

      {/* More */}
      <section>
        <h2 className="mb-3 text-[17px] font-bold tracking-tight text-fg">More</h2>
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {MORE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-fg transition-colors active:bg-surface-2"
              >
                <item.icon className="size-[18px] text-fg-subtle" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="size-4 text-fg-subtle" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-[12px] leading-relaxed text-fg-subtle">
        {site.hours}
        <br />
        {site.emergency} · {site.phones[0]}
      </p>
    </div>
  );
}
