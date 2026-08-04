'use client';

import { TicketList } from '@/components/tickets/ticket-list';

export default function TechTicketsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg">My tickets</h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          Everything assigned to you — current jobs and your full history.
        </p>
      </div>

      <TicketList basePath="/tech/tickets" />
    </div>
  );
}
