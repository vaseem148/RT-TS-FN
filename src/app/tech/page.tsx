'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Star,
} from 'lucide-react';
import { statsApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { cn, slaLabel, timeAgo, titleCase } from '@/lib/utils';
import { CATEGORY_ICON } from '@/lib/ticket-meta';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { EmptyState, Icon, Skeleton } from '@/components/ui/misc';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusDonut } from '@/components/dashboard/charts';

export default function TechDashboardPage() {
  const { user } = useAuth();
  const {
    data,
    error,
    refresh: load,
    validating: refreshing,
  } = useApi('stats:technician', () => statsApi.technician(), { ttl: 30_000 });

  if (error && !data) {
    return (
      <EmptyState
        icon="ServerCrash"
        title="Could not load your dashboard"
        description={error}
        action={
          <Button onClick={load} variant="outline">
            Try again
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const { kpis, charts, queue } = data;

  return (
    <div className="flex flex-col gap-6">
      <Card className="relative overflow-hidden p-6">
        <div className="aurora opacity-70" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-brand">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-fg">
              {kpis.active > 0
                ? `${kpis.active} job${kpis.active === 1 ? '' : 's'} on your plate, ${user?.name?.split(' ')[0]}`
                : `All clear, ${user?.name?.split(' ')[0]} 🎉`}
            </h1>
            <p className="mt-1 text-[14px] text-fg-muted">
              {kpis.overdue > 0
                ? `${kpis.overdue} ticket${kpis.overdue === 1 ? ' has' : 's have'} breached SLA — start with those.`
                : 'Nothing overdue. Work through the queue below, closest deadline first.'}
            </p>
          </div>
          <Button variant="secondary" onClick={load} loading={refreshing}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active jobs" value={kpis.active} icon="Ticket" tone="brand" href="/tech/tickets" />
        <StatCard label="In progress" value={kpis.inProgress} icon="Activity" tone="accent" />
        <StatCard
          label="Overdue"
          value={kpis.overdue}
          icon="TriangleAlert"
          tone={kpis.overdue > 0 ? 'danger' : 'success'}
        />
        <StatCard label="Resolved today" value={kpis.resolvedToday} icon="CircleCheck" tone="success" />
        <StatCard
          label="My rating"
          value={kpis.avgRating}
          icon="Star"
          tone="warning"
          suffix=" / 5"
          decimals={1}
          hint={`${kpis.ratingCount} reviews`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h2 className="text-[15px] font-bold text-fg">Today&apos;s queue</h2>
              <p className="mt-0.5 text-[12.5px] text-fg-muted">
                Sorted by response deadline — most urgent first
              </p>
            </div>
            <Link
              href="/tech/tickets"
              className="inline-flex items-center gap-1 text-[13px] font-bold text-brand hover:underline"
            >
              All tickets
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {queue.length === 0 ? (
            <EmptyState
              icon="CircleCheckBig"
              title="Nothing in your queue"
              description="You have no open assignments right now. New tickets will appear here the moment an admin assigns them to you."
            />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {queue.map((ticket) => {
                const sla = slaLabel(ticket.slaDueAt);
                const address = [ticket.location?.line1, ticket.location?.city]
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div key={ticket._id} className="p-4 transition-colors hover:bg-surface-2 sm:p-5">
                    <div className="flex items-start gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-linear-135 from-brand/12 to-accent/12 text-brand">
                        <Icon name={CATEGORY_ICON[ticket.category]} className="size-5" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11.5px] font-bold text-fg-subtle">
                            {ticket.ticketNumber}
                          </span>
                          <StatusBadge status={ticket.status} />
                          <PriorityBadge priority={ticket.priority} />
                          {sla?.overdue && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-danger/25 bg-danger-soft px-2 py-0.5 text-[10.5px] font-bold text-danger">
                              <AlertTriangle className="size-3" />
                              {sla.text}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/tech/tickets/${ticket._id}`}
                          className="mt-1.5 block truncate text-[15px] font-bold text-fg transition-colors hover:text-brand"
                        >
                          {ticket.subject}
                        </Link>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-fg-subtle">
                          <span>{titleCase(ticket.category)}</span>
                          <span>Raised {timeAgo(ticket.createdAt)}</span>
                          {address && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="size-3.5" />
                              {address}
                            </span>
                          )}
                          {sla && !sla.overdue && (
                            <span className="font-mono font-bold text-success">{sla.text}</span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button href={`/tech/tickets/${ticket._id}`} size="sm">
                            Open ticket
                          </Button>
                          {ticket.customer?.phone && (
                            <Button
                              href={`tel:${ticket.customer.phone}`}
                              variant="secondary"
                              size="sm"
                            >
                              <Phone className="size-3.5" />
                              {ticket.customer.name?.split(' ')[0]}
                            </Button>
                          )}
                          {address && (
                            <Button
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                              variant="outline"
                              size="sm"
                            >
                              <Navigation className="size-3.5" />
                              Directions
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-fg">My workload</h2>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">Everything assigned to you, by status</p>
            <div className="mt-2">
              {charts.byStatus.length > 0 ? (
                <StatusDonut data={charts.byStatus} />
              ) : (
                <p className="py-16 text-center text-[13px] text-fg-subtle">
                  No tickets assigned yet.
                </p>
              )}
            </div>
          </Card>

          <Card className={cn('p-5', kpis.avgRating >= 4.5 && 'border-warning/30')}>
            <div className="flex items-center gap-2">
              <Star className="size-4 fill-warning text-warning" />
              <h2 className="text-[15px] font-bold text-fg">Your rating</h2>
            </div>
            <p className="mt-2.5 text-3xl font-extrabold text-fg">
              {kpis.avgRating > 0 ? kpis.avgRating.toFixed(1) : '—'}
              <span className="ml-1 text-base font-medium text-fg-subtle">/ 5</span>
            </p>
            <p className="mt-1 text-[12.5px] text-fg-muted">
              {kpis.ratingCount > 0
                ? `From ${kpis.ratingCount} customer review${kpis.ratingCount === 1 ? '' : 's'} on jobs you closed.`
                : 'No reviews yet — ratings appear once customers sign off on your closed tickets.'}
            </p>
            <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-fg-muted">
              <span className="font-bold text-fg">{kpis.resolved}</span> tickets resolved in total.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
