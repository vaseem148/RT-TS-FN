'use client';

import Link from 'next/link';
import { ArrowRight, RefreshCw, Star, TrendingUp } from 'lucide-react';
import { statsApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { formatCurrency, timeAgo, titleCase } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriorityBadge, StatusBadge } from '@/components/ui/badge';
import { Avatar, EmptyState, Skeleton } from '@/components/ui/misc';
import { StatCard } from '@/components/dashboard/stat-card';
import { CategoryBars, StatusDonut, TrendChart } from '@/components/dashboard/charts';

export default function AdminDashboardPage() {
  const {
    data,
    error,
    refresh: load,
    validating: refreshing,
  } = useApi('stats:admin', () => statsApi.admin(), { ttl: 30_000 });

  if (error && !data) {
    return (
      <EmptyState
        icon="ServerCrash"
        title="Could not load the dashboard"
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
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { kpis, charts, topTechnicians, recentTickets } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-fg sm:text-2xl">
            Service desk overview
          </h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            Everything happening across Renderways right now.
          </p>
        </div>
        <Button variant="secondary" onClick={load} loading={refreshing}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-4 app:grid-cols-2 app:gap-3">
        <StatCard
          label="Open tickets"
          value={kpis.openTickets}
          icon="Ticket"
          tone="brand"
          href="/admin/tickets"
          hint={`${kpis.ticketsToday} today`}
        />
        <StatCard
          label="Overdue (SLA breached)"
          value={kpis.overdueTickets}
          icon="TriangleAlert"
          tone={kpis.overdueTickets > 0 ? 'danger' : 'success'}
          href="/admin/tickets"
        />
        <StatCard
          label="Waiting to be assigned"
          value={kpis.unassignedTickets}
          icon="UserPlus"
          tone={kpis.unassignedTickets > 0 ? 'warning' : 'neutral'}
          href="/admin/tickets"
        />
        <StatCard
          label="New enquiries"
          value={kpis.newEnquiries}
          icon="Inbox"
          tone="accent"
          href="/admin/enquiries"
        />

        <StatCard
          label="Resolution rate"
          value={kpis.resolutionRate}
          icon="CircleCheck"
          tone="success"
          suffix="%"
        />
        <StatCard
          label="Avg. resolution time"
          value={kpis.avgResolutionHours}
          icon="Timer"
          tone="brand"
          suffix=" hrs"
          decimals={1}
        />
        <StatCard
          label="Customer rating"
          value={kpis.avgRating}
          icon="Star"
          tone="warning"
          suffix=" / 5"
          decimals={1}
          hint={`${kpis.ratingCount} reviews`}
        />
        <StatCard
          label="Revenue (closed jobs)"
          value={kpis.revenue}
          icon="IndianRupee"
          tone="success"
          prefix="₹"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-bold text-fg">Tickets over the last 30 days</h2>
              <p className="mt-0.5 text-[12.5px] text-fg-muted">Raised vs resolved, per day</p>
            </div>
            <div className="flex gap-3 text-[11.5px] font-semibold">
              <span className="flex items-center gap-1.5 text-fg-muted">
                <span className="size-2 rounded-full bg-brand" /> Raised
              </span>
              <span className="flex items-center gap-1.5 text-fg-muted">
                <span className="size-2 rounded-full bg-success" /> Resolved
              </span>
            </div>
          </div>
          <div className="mt-4">
            {charts.trend.length > 0 ? (
              <TrendChart data={charts.trend} />
            ) : (
              <p className="py-20 text-center text-[13px] text-fg-subtle">
                No tickets in the last 30 days yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-[15px] font-bold text-fg">Tickets by status</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">Where everything currently sits</p>
          <div className="mt-2">
            {charts.byStatus.length > 0 ? (
              <StatusDonut data={charts.byStatus} />
            ) : (
              <p className="py-20 text-center text-[13px] text-fg-subtle">No data yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[15px] font-bold text-fg">Busiest service lines</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">Ticket volume by category</p>
          <div className="mt-4">
            {charts.byCategory.length > 0 ? (
              <CategoryBars data={charts.byCategory} />
            ) : (
              <p className="py-20 text-center text-[13px] text-fg-subtle">No data yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-brand" />
            <h2 className="text-[15px] font-bold text-fg">Top technicians</h2>
          </div>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">Ranked by tickets resolved</p>

          <div className="mt-4 flex flex-col gap-2.5">
            {topTechnicians.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-fg-subtle">
                No assignments recorded yet.
              </p>
            ) : (
              topTechnicians.map((tech, index) => (
                <div
                  key={tech._id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface font-mono text-[11px] font-bold text-fg-subtle">
                    {index + 1}
                  </span>
                  <Avatar name={tech.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-fg">{tech.name}</p>
                    <p className="text-[11.5px] text-fg-subtle">
                      {tech.resolved} resolved of {tech.total} assigned
                    </p>
                  </div>
                  {tech.avgRating > 0 && (
                    <span className="flex shrink-0 items-center gap-1 rounded-lg bg-warning-soft px-2 py-1 text-[11.5px] font-bold text-warning">
                      <Star className="size-3 fill-current" />
                      {tech.avgRating}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <h2 className="text-[15px] font-bold text-fg">Latest tickets</h2>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-1 text-[13px] font-bold text-brand hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left">
            <thead className="bg-surface-2 text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
              <tr>
                <th className="px-5 py-3">Ticket</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Raised</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentTickets.map((ticket) => (
                <tr key={ticket._id} className="transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/tickets/${ticket._id}`} className="group block">
                      <span className="block font-mono text-[11.5px] font-bold text-fg-subtle">
                        {ticket.ticketNumber}
                      </span>
                      <span className="block max-w-64 truncate text-[13px] font-semibold text-fg group-hover:text-brand">
                        {ticket.subject}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-fg-muted">
                    {ticket.customer?.name ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-fg-muted">
                    {titleCase(ticket.category)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-5 py-3.5 text-[12.5px] whitespace-nowrap text-fg-subtle">
                    {timeAgo(ticket.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="stagger grid gap-4 sm:grid-cols-3">
        <StatCard label="Total customers" value={kpis.customers} icon="Users" tone="brand" href="/admin/users" />
        <StatCard label="Active technicians" value={kpis.technicians} icon="Wrench" tone="accent" href="/admin/users" />
        <StatCard
          label="Products low on stock"
          value={kpis.lowStockProducts}
          icon="PackageMinus"
          tone={kpis.lowStockProducts > 0 ? 'warning' : 'neutral'}
        />
      </div>

      <p className="text-center text-[12px] text-fg-subtle">
        Lifetime revenue from closed jobs: {formatCurrency(kpis.revenue)} across{' '}
        {kpis.resolvedTickets} completed tickets.
      </p>
    </div>
  );
}
