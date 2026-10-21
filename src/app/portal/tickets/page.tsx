'use client';

import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketList } from '@/components/tickets/ticket-list';

export default function MyTicketsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-fg app:hidden">My tickets</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            Every service request you have raised with Renderways, newest first.
          </p>
        </div>
        <Button href="/portal/tickets/new">
          <CirclePlus className="size-4" />
          Raise a ticket
        </Button>
      </div>

      <TicketList
        basePath="/portal/tickets"
        emptyAction={
          <Button href="/portal/tickets/new">
            <CirclePlus className="size-4" />
            Raise your first ticket
          </Button>
        }
      />
    </div>
  );
}
