'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronRight, MapPin, MessageCircle, Phone, Search, X } from 'lucide-react';
import { site, whatsappLink } from '@/lib/site';
import { serviceApi, ticketApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { useIsApp } from '@/lib/app-mode';
import { formatCurrency } from '@/lib/utils';
import { homeFor, useAuth } from '@/components/providers/auth-provider';
import { APP_MORE_LINKS } from '@/components/layout/app-links';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { TicketCard } from '@/components/tickets/ticket-list';
import { Button } from '@/components/ui/button';
import { Icon, Skeleton, Spinner } from '@/components/ui/misc';

const TICKET_NUMBER = /^RW-?\d/i;

/**
 * Home screen of the Android app (the website keeps its marketing home page):
 * search, service categories, offers and — for customers — their tickets.
 * Staff skip it and land on their own dashboards.
 */
export function AppHome() {
  const isApp = useIsApp();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [query, setQuery] = useState('');

  const isCustomer = user?.role === 'customer';
  const { data: services } = useApi('services', () => serviceApi.list(), { ttl: 300_000 });
  const { data: recent } = useApi(isApp && isCustomer ? 'tickets:app-home' : null, () =>
    ticketApi.list({ limit: 3, sort: '-createdAt' })
  );

  useEffect(() => {
    if (isApp && user && user.role !== 'customer') router.replace(homeFor(user.role));
  }, [isApp, user, router]);

  const term = query.trim();
  const matches = useMemo(() => {
    if (!services || !term) return services;
    const needle = term.toLowerCase();
    return services.filter((service) =>
      [service.title, service.shortDescription, ...service.features].join(' ').toLowerCase().includes(needle)
    );
  }, [services, term]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (TICKET_NUMBER.test(term)) router.push(`/track?t=${encodeURIComponent(term.toUpperCase())}`);
    else if (matches?.length === 1) router.push(`/services/${matches[0].slug}`);
  };

  if (loading || (user && !isCustomer)) {
    return (
      <div className="grid min-h-[70dvh] place-items-center">
        <Spinner />
      </div>
    );
  }

  const searching = term.length > 0;
  const tiles = searching ? matches : matches?.slice(0, 6);
  const amc = services?.find((service) => service.ticketCategory === 'amc');
  const popular = services?.filter((service) => service.isFeatured) ?? [];

  return (
    <div className="pb-6">
      {/* Header */}
      <section className="app-hero relative isolate overflow-hidden px-5 pt-[calc(var(--safe-top)+1rem)] pb-14">
        <span className="absolute -top-20 -right-16 -z-10 size-60 animate-float rounded-full bg-white/[0.07]" aria-hidden />
        <span
          className="absolute top-28 -left-24 -z-10 size-44 animate-float rounded-full bg-white/[0.04] [animation-delay:-3.5s]"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.28em] text-fg-muted">RENDERWAYS</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-bold">
              <MapPin className="size-4 text-brand" />
              Chennai · Vellore
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${site.primaryPhone}`}
              aria-label="Call us"
              className="grid size-9 place-items-center rounded-full border border-line bg-surface-2 text-fg transition-transform active:scale-90"
            >
              <Phone className="size-[17px]" />
            </a>
            <ThemeToggle className="rounded-full" />
          </div>
        </div>

        <h1 className="mt-6 text-[1.65rem] leading-tight font-extrabold tracking-tight">
          {isCustomer ? `Hi ${user.name.split(' ')[0]} 👋` : 'IT support at your doorstep'}
        </h1>
        <p className="mt-1 text-[13px] text-fg-muted">
          {isCustomer ? 'What can we fix for you today?' : 'Free diagnosis · 30-day warranty · 24/7 emergency'}
        </p>
      </section>

      {/* Search: filters the services below, or tracks a ticket number */}
      <form
        onSubmit={submit}
        className="relative z-10 mx-4 -mt-7 flex items-center gap-2.5 rounded-2xl border border-line bg-surface pr-2 pl-4 shadow-lg shadow-black/5"
      >
        <Search className="size-[18px] shrink-0 text-fg-subtle" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search laptop repair, CCTV, ticket no…"
          aria-label="Search services or track a ticket"
          enterKeyHint="search"
          className="h-13 min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-fg-subtle"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="grid size-8 place-items-center rounded-full text-fg-subtle active:bg-surface-2"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <div className="stagger mx-auto max-w-lg space-y-7 px-4 pt-6">
        {TICKET_NUMBER.test(term) && (
          <Link
            href={`/track?t=${encodeURIComponent(term.toUpperCase())}`}
            className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4 text-brand transition-transform active:scale-[0.98]"
          >
            <Search className="size-5 shrink-0" />
            <span className="flex-1 text-[14px] font-bold">Track ticket {term.toUpperCase()}</span>
            <ArrowRight className="size-4" />
          </Link>
        )}

        {/* Categories */}
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[16px] font-bold tracking-tight text-fg">
              {searching ? 'Matching services' : 'What do you need today?'}
            </h2>
            {!searching && (
              <Link href="/services" className="text-[13px] font-bold text-brand">
                See all
              </Link>
            )}
          </div>

          {tiles && tiles.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line-strong p-5 text-center text-[13.5px] text-fg-muted">
              No service matches “{term}”. Try “laptop”, “CCTV” or “data”.
            </p>
          ) : (
            <div className="stagger grid grid-cols-3 gap-3">
              {!tiles
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-30 rounded-2xl" />
                  ))
                : tiles.map((service) => (
                    <Link
                      key={service._id}
                      href={`/services/${service.slug}`}
                      className="flex flex-col items-center rounded-2xl border border-line bg-surface px-2 pt-4 pb-3 text-center shadow-sm shadow-black/[0.03] transition-transform active:scale-95"
                    >
                      <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent">
                        <Icon name={service.icon} className="size-[22px]" />
                      </span>
                      <span className="mt-2.5 line-clamp-2 text-[12.5px] leading-tight font-bold text-fg">
                        {service.title}
                      </span>
                      <span className="mt-auto pt-1 text-[10.5px] text-fg-subtle">
                        From {formatCurrency(service.startingPrice)}
                      </span>
                    </Link>
                  ))}
            </div>
          )}
        </section>

        {/* The customer's own tickets */}
        {isCustomer && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <h2 className="text-[16px] font-bold tracking-tight text-fg">Your tickets</h2>
              <Link href="/portal/tickets" className="text-[13px] font-bold text-brand">
                View all
              </Link>
            </div>
            {!recent ? (
              <Skeleton className="h-28 rounded-2xl" />
            ) : recent.tickets.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-5 text-center">
                <p className="text-[14px] font-bold text-fg">No tickets yet</p>
                <p className="mt-1 text-[13px] text-fg-muted">Raise one and follow every step here.</p>
                <Button href="/portal/tickets/new" size="sm" className="mt-4 rounded-full px-5">
                  Raise a ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recent.tickets.map((ticket) => (
                  <TicketCard key={ticket._id} ticket={ticket} basePath="/portal/tickets" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Offer */}
        <Link
          href={amc ? `/services/${amc.slug}` : '/portal/tickets/new'}
          className="relative isolate block overflow-hidden rounded-3xl bg-linear-135 from-brand to-brand-strong p-5 text-white shadow-lg shadow-brand/25 transition-transform active:scale-[0.98]"
        >
          <span className="absolute -right-10 -bottom-20 -z-10 size-48 rounded-full bg-white/12" aria-hidden />
          <span className="absolute -top-12 right-16 -z-10 size-24 rounded-full bg-white/10" aria-hidden />
          <p className="text-[18px] leading-tight font-extrabold">
            {amc ? `Annual AMC from ${formatCurrency(amc.startingPrice)}` : 'Free diagnosis on every repair'}
          </p>
          <p className="mt-1 text-[12.5px] text-white/80">
            {amc
              ? [amc.priceNote, amc.turnaround].filter(Boolean).join(' · ')
              : 'Know exactly what failed before you pay a rupee'}
          </p>
          <span className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-[12.5px] font-bold text-brand">
            {amc ? 'View plans' : 'Raise a ticket'}
          </span>
        </Link>

        {/* Popular */}
        {popular.length > 0 && (
          <section>
            <h2 className="mb-3 text-[16px] font-bold tracking-tight text-fg">Popular services</h2>
            <div className="stagger scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
              {popular.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="w-[46%] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-surface transition-transform active:scale-[0.97]"
                >
                  <span className="flex h-16 items-center bg-accent-soft px-4 text-accent">
                    <Icon name={service.icon} className="size-6" />
                  </span>
                  <span className="block px-3.5 pt-3 pb-3.5">
                    <span className="line-clamp-1 text-[13.5px] font-bold text-fg">{service.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] font-bold text-brand">
                      {formatCurrency(service.startingPrice)}{' '}
                      <span className="font-medium">{service.priceNote}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Talk to us — the website's floating buttons live here in the app */}
        <section className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${site.primaryPhone}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-transform active:scale-[0.97]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <Phone className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-fg">Call us</span>
              <span className="block truncate text-[11px] text-fg-subtle">24/7 emergency</span>
            </span>
          </a>
          <a
            href={whatsappLink()}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-transform active:scale-[0.97]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
              <MessageCircle className="size-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-bold text-fg">WhatsApp</span>
              <span className="block truncate text-[11px] text-fg-subtle">Chat with us</span>
            </span>
          </a>
        </section>

        {!user && (
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
        )}

        {/* More */}
        <section>
          <h2 className="mb-3 text-[16px] font-bold tracking-tight text-fg">More</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {APP_MORE_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 text-[14.5px] font-semibold text-fg transition-colors active:bg-surface-2"
                >
                  <item.icon className="size-[18px] text-accent" />
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
    </div>
  );
}
