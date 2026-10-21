'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, ChevronRight, Clock, Phone } from 'lucide-react';
import { serviceApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { site } from '@/lib/site';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, Icon, Reveal, Skeleton } from '@/components/ui/misc';

export default function ServicesPage() {
  const {
    data: services,
    error,
    loading,
  } = useApi('services', () => serviceApi.list(), {
    ttl: 300_000,
  });

  return (
    <>
      <PageHeader
        eyebrow="Our services"
        breadcrumbs={[{ label: 'Services' }]}
        title={
          <>
            Repairs, installations and support —{' '}
            <span className="text-gradient">done properly</span>
          </>
        }
        description="Eleven service lines covering everything from a single stuck key to an eight-camera warehouse rollout. Free diagnosis on repairs, honest quotes before we start, and a 30-day warranty on the work."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/portal/tickets/new" size="lg">
            Book a service
            <ArrowRight className="size-4" />
          </Button>
          <Button href={`tel:${site.primaryPhone}`} variant="outline" size="lg">
            <Phone className="size-4" />
            {site.phones[0]}
          </Button>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 app:max-w-lg app:py-5">
        {error && (
          <div className="mb-8 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {loading || !services ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            icon="Wrench"
            title="No services to show"
            description="The service catalogue could not be loaded. Make sure the Renderways API is running."
          />
        ) : (
          <>
            {/* App: a compact list; the details live one tap away. */}
            <div className="hidden space-y-3 app:block">
              {services.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-3.5 transition-transform active:scale-[0.98]"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon name={service.icon} className="size-[22px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14.5px] font-bold text-fg">
                        {service.title}
                      </span>
                      {service.isFeatured && (
                        <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[9.5px] font-bold tracking-wide text-brand uppercase">
                          Popular
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-fg-muted">
                      {service.shortDescription}
                    </span>
                    <span className="mt-1 block text-[12.5px] font-bold text-brand">
                      From {formatCurrency(service.startingPrice)}{' '}
                      <span className="font-medium text-fg-subtle">{service.priceNote}</span>
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" />
                </Link>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 app:hidden">
              {services.map((service, index) => (
                <Reveal key={service._id} delay={(index % 3) * 0.07}>
                  <Card hover className="group flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-12 place-items-center rounded-xl bg-linear-135 from-brand/15 to-accent/15 text-brand transition-transform duration-300 group-hover:scale-110">
                        <Icon name={service.icon} className="size-6" />
                      </span>
                      {service.isFeatured && (
                        <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-1 text-[10px] font-bold tracking-wide text-accent uppercase">
                          Popular
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-fg">{service.title}</h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">
                      {service.shortDescription}
                    </p>

                    <ul className="mt-4 flex-1 space-y-1.5">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[13px] text-fg-muted"
                        >
                          <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {service.turnaround && (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand">
                        <Clock className="size-3.5" />
                        {service.turnaround}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                      <div>
                        <p className="text-[11px] text-fg-subtle">Starting at</p>
                        <p className="text-base font-extrabold text-fg">
                          {formatCurrency(service.startingPrice)}
                          <span className="ml-1 text-[11px] font-medium text-fg-subtle">
                            {service.priceNote}
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1 text-[13px] font-bold text-brand transition-transform hover:translate-x-0.5"
                      >
                        View details
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
