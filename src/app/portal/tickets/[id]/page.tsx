'use client';

import { use } from 'react';
import { TicketDetail } from '@/components/tickets/ticket-detail';

export default function PortalTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketDetail ticketId={id} basePath="/portal/tickets" />;
}
