'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TicketList } from '@/components/tickets/ticket-list';

const VIEWS = [
  { key: 'all', label: 'All tickets', query: {} },
  { key: 'unassigned', label: 'Unassigned', query: { unassigned: 'true' } },
  { key: 'overdue', label: 'SLA breached', query: { overdue: 'true' } },
];

export default function AdminTicketsPage() {
  const [view, setView] = useState('all');
  const active = VIEWS.find((v) => v.key === view) ?? VIEWS[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg">All tickets</h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          Every service request across both branches. Assign, prioritise and follow up from here.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={cn(
              'rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-colors',
              view === item.key
                ? 'border-brand bg-brand text-brand-fg'
                : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <TicketList
        key={view}
        basePath="/admin/tickets"
        baseQuery={active.query}
        showFilters={view === 'all'}
      />
    </div>
  );
}
