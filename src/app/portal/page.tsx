'use client';

import Link from 'next/link';
import { ArrowRight, CirclePlus, Phone, Sparkles } from 'lucide-react';
import { serviceApi, ticketApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { site } from '@/lib/site';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { TicketCard } from '@/components/tickets/ticket-list';
import { EmptyState, Icon, Skeleton } from '@/components/ui/misc';

export default function PortalOverview() {
  const { user } = useAuth();

  const { data: ticketData, loading } = useApi(
    'portal:recent-tickets',
    () => ticketApi.list({ limit: 5, sort: '-createdAt' }),
    { ttl: 20_000 }
  );
  const { data: featured } = useApi(
    'services:featured',
    () => serviceApi.list({ featured: 'true' }),
    { ttl: 300_000 }
  );

  const tickets = loading ? null : (ticketData?.tickets ?? []);
  const services = (featured ?? []).slice(0, 4);

  const counts = {
    total: tickets?.length ?? 0,
    active:
      tickets?.filter((t) => !['resolved', 'closed', 'cancelled'].includes(t.status)).length ?? 0,
    resolved: tickets?.filter((t) => ['resolved', 'closed'].includes(t.status)).length ?? 0,
    overdue: tickets?.filter((t) => t.isOverdue).length ?? 0,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <Card className="relative overflow-hidden p-6 sm:p-7">
        <div className="aurora opacity-70" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[13px] font-semibold text-brand">
              {new Date().getHours() < 12
                ? 'Good morning'
                : new Date().getHours() < 17
                  ? 'Good afternoon'
                  : 'Good evening'}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
              Hi {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-1.5 max-w-lg text-[14px] text-fg-muted">
              Everything you have raised with Renderways lives here — live status, technician
              details and your full service history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button href="/portal/tickets/new">
              <CirclePlus className="size-4" />
              Raise a ticket
            </Button>
            <Button href={`tel:${site.primaryPhone}`} variant="outline">
              <Phone className="size-4" />
              Call us
            </Button>
          </div>
        </div>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Recent tickets"
          value={counts.total}
          icon="Ticket"
          tone="brand"
          href="/portal/tickets"
        />
        <StatCard
          label="Currently active"
          value={counts.active}
          icon="Activity"
          tone="accent"
          href="/portal/tickets"
        />
        <StatCard label="Resolved" value={counts.resolved} icon="CircleCheck" tone="success" />
        <StatCard
          label="Needs attention"
          value={counts.overdue}
          icon="TriangleAlert"
          tone={counts.overdue > 0 ? 'danger' : 'neutral'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-fg">Recent tickets</h2>
            <Link
              href="/portal/tickets"
              className="inline-flex items-center gap-1 text-[13px] font-bold text-brand hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {!tickets ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <EmptyState
                icon="TicketPlus"
                title="No tickets yet"
                description="When something breaks — a laptop, a camera, a network — raise a ticket and we will get a technician on it right away."
                action={
                  <Button href="/portal/tickets/new">
                    <CirclePlus className="size-4" />
                    Raise your first ticket
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="stagger flex flex-col gap-3">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} basePath="/portal/tickets" />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-brand" />
              <h2 className="text-[15px] font-bold text-fg">Popular services</h2>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/portal/tickets/new?category=${encodeURIComponent(service.ticketCategory)}&subject=${encodeURIComponent(service.title)}`}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3 transition-colors hover:border-brand/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Icon name={service.icon} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-bold text-fg">
                      {service.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-fg-subtle">
                      {service.turnaround || service.shortDescription}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-fg">Need us urgently?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              Our emergency line is staffed 24/7 — even on Sundays and public holidays.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {site.phones.slice(0, 2).map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[14px] font-bold text-fg transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Phone className="size-4 text-brand" />
                  {phone}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
