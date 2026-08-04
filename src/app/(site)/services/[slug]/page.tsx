'use client';

import { use, useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, Clock, Phone, ShieldCheck, Wallet } from 'lucide-react';
import { serviceApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import type { Service } from '@/lib/types';
import { site } from '@/lib/site';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, Icon, Skeleton } from '@/components/ui/misc';

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    serviceApi
      .get(slug)
      .then(setService)
      .catch((err) => setError(toApiError(err).message));
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState
          icon="SearchX"
          title="Service not found"
          description={error}
          action={
            <Button href="/services" variant="outline">
              Browse all services
            </Button>
          }
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-20">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const bookHref = `/portal/tickets/new?category=${encodeURIComponent(service.ticketCategory)}&subject=${encodeURIComponent(service.title)}`;

  return (
    <>
      <PageHeader
        eyebrow="Service"
        breadcrumbs={[{ label: 'Services', href: '/services' }, { label: service.title }]}
        title={service.title}
        description={service.shortDescription}
      >
        <div className="flex flex-wrap gap-3">
          <Button href={bookHref} size="lg">
            Book this service
            <ArrowRight className="size-4" />
          </Button>
          <Button href={`tel:${site.primaryPhone}`} variant="outline" size="lg">
            <Phone className="size-4" />
            Talk to a technician
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <span className="grid size-14 place-items-center rounded-2xl bg-linear-135 from-brand/15 to-accent/15 text-brand">
            <Icon name={service.icon} className="size-7" />
          </span>

          {service.description && (
            <p className="mt-6 text-[16px] leading-[1.75] text-fg-muted">{service.description}</p>
          )}

          <h2 className="mt-10 text-xl font-bold text-fg">What&apos;s included</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-surface p-3.5 text-[14px] text-fg"
              >
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                {feature}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-bold text-fg">How it works</h2>
          <ol className="mt-4 space-y-4">
            {[
              {
                title: 'Raise a ticket or call us',
                body: 'Tell us the fault and pick on-site, carry-in or pickup. Takes under a minute.',
              },
              {
                title: 'Free diagnosis',
                body: 'A specialist inspects the device and reports exactly what has failed — no charge, no obligation.',
              },
              {
                title: 'You approve the quote',
                body: 'We post the estimate into your ticket. Work starts only after you say yes.',
              },
              {
                title: 'Repair, test and hand over',
                body: 'We fix it, stress-test it, and close the ticket with a written resolution and 30-day warranty.',
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft font-mono text-[13px] font-bold text-brand">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[15px] font-bold text-fg">{step.title}</p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-fg-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
              Starting price
            </p>
            <p className="mt-1 text-3xl font-extrabold text-fg">
              {formatCurrency(service.startingPrice)}
            </p>
            {service.priceNote && (
              <p className="mt-0.5 text-[13px] text-fg-muted">{service.priceNote}</p>
            )}

            <div className="mt-5 space-y-3 border-t border-line pt-5">
              {service.turnaround && (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-[13px] font-bold text-fg">Turnaround</p>
                    <p className="text-[13px] text-fg-muted">{service.turnaround}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[13px] font-bold text-fg">Warranty</p>
                  <p className="text-[13px] text-fg-muted">30 days on all repair work</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Wallet className="mt-0.5 size-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[13px] font-bold text-fg">Payment</p>
                  <p className="text-[13px] text-fg-muted">Cash, UPI, card and bank transfer</p>
                </div>
              </div>
            </div>

            <Button href={bookHref} size="lg" className="mt-6 w-full">
              Book this service
            </Button>
            <Button
              href={`tel:${site.primaryPhone}`}
              variant="secondary"
              size="md"
              className="mt-2.5 w-full"
            >
              <Phone className="size-4" />
              {site.phones[0]}
            </Button>

            <p className="mt-4 text-center text-[12px] text-fg-subtle">
              Serving Chennai &amp; Vellore · {site.hours}
            </p>
          </Card>
        </aside>
      </section>
    </>
  );
}
