import Link from 'next/link';
import { ArrowLeft, Phone, Search, Ticket } from 'lucide-react';
import { site } from '@/lib/site';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 -z-10 grid-bg" aria-hidden />

      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <p className="mt-10 font-mono text-7xl font-extrabold tracking-tight text-gradient sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
          This page went missing
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
          The link is broken or the page has moved. Everything else is exactly where you left it.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg">
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
          <Button href="/track" variant="outline" size="lg">
            <Search className="size-4" />
            Track a ticket
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px]">
          <Link href="/services" className="text-fg-muted transition-colors hover:text-brand">
            Services
          </Link>
          <Link href="/products" className="text-fg-muted transition-colors hover:text-brand">
            Products
          </Link>
          <Link
            href="/portal/tickets/new"
            className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-brand"
          >
            <Ticket className="size-3.5" />
            Raise a ticket
          </Link>
          <a
            href={`tel:${site.primaryPhone}`}
            className="inline-flex items-center gap-1.5 text-fg-muted transition-colors hover:text-brand"
          >
            <Phone className="size-3.5" />
            {site.phones[0]}
          </a>
        </div>
      </div>
    </div>
  );
}
