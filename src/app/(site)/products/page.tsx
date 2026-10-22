'use client';

import { useState } from 'react';
import { PackageSearch, Phone, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { productApi } from '@/lib/endpoints';
import { useApi } from '@/lib/use-api';
import { site } from '@/lib/site';
import { cn, formatCurrency, titleCase } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, Icon, Pagination, Reveal, Skeleton } from '@/components/ui/misc';
import { ART_TINTS, ServiceArt, artForProduct } from '@/components/app/service-art';
import { canBuy } from '@/components/providers/cart-provider';
import { AddToCart, ViewCartBar } from '@/components/shop/shop-buttons';

const CATEGORY_ICON: Record<string, string> = {
  desktop: 'Monitor',
  laptop: 'Laptop',
  cctv: 'Cctv',
  accessories: 'Mouse',
  'spare-parts': 'Cpu',
  networking: 'Network',
  storage: 'HardDrive',
  rental: 'PackageOpen',
};

export default function ProductsPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, loading } = useApi(
    `products:${category}:${query}:${page}`,
    () =>
      productApi.list({
        category: category || undefined,
        search: query || undefined,
        page,
        limit: 12,
      }),
    { ttl: 120_000 }
  );

  const products = data?.products;
  const categories = data?.facets.categories ?? [];
  const pages = data?.pagination.pages ?? 1;
  const total = data?.pagination.total ?? 0;

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  return (
    <>
      <PageHeader
        eyebrow="Products"
        breadcrumbs={[{ label: 'Products' }]}
        title={
          <>
            Hardware we <span className="text-gradient">stand behind</span>
          </>
        }
        description="Desktops, laptops, CCTV kits, storage, spares and rental hardware — all tested in-house before it reaches you, with warranty and free installation across Chennai and Vellore."
      >
        <form onSubmit={onSearch} className="flex max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search laptops, cameras, SSDs..."
              className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
              aria-label="Search products"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </PageHeader>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 app:py-6">
        <div className="scrollbar-none -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            onClick={() => {
              setCategory('');
              setPage(1);
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
              !category
                ? 'border-brand bg-brand text-brand-fg'
                : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
            )}
          >
            All products
          </button>
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item);
                setPage(1);
              }}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                category === item
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
              )}
            >
              <Icon name={CATEGORY_ICON[item]} className="size-3.5" />
              {titleCase(item)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {products && products.length > 0 && (
          <p className="mb-5 text-[13px] text-fg-muted">
            Showing <span className="font-bold text-fg">{products.length}</span> of{' '}
            <span className="font-bold text-fg">{total}</span> products
          </p>
        )}

        {loading || !products ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon="PackageSearch"
            title="Nothing matched that search"
            description="Try a different keyword or browse another category — and if you cannot find it, just call us. We source parts daily."
            action={
              <Button href={`tel:${site.primaryPhone}`} variant="outline">
                <Phone className="size-4" />
                {site.phones[0]}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const isRental = product.category === 'rental';
              const discount =
                product.mrp > product.price && product.price > 0
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

              return (
                <Reveal key={product._id} delay={(index % 4) * 0.05}>
                  <Card hover className="group flex h-full flex-col overflow-hidden">
                    <div
                      className="relative grid h-36 place-items-center"
                      style={{ background: ART_TINTS[artForProduct(product)] }}
                    >
                      <ServiceArt
                        kind={artForProduct(product)}
                        size={96}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 rounded-md bg-danger px-2 py-0.5 text-[10.5px] font-bold text-white">
                          {discount}% OFF
                        </span>
                      )}
                      {product.condition !== 'new' && (
                        <span className="absolute top-3 right-3 rounded-md border border-line bg-surface px-2 py-0.5 text-[10.5px] font-bold text-fg-muted capitalize">
                          {product.condition}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      {product.brand && (
                        <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">
                          {product.brand}
                        </p>
                      )}
                      <h2 className="mt-1 line-clamp-2 text-[14.5px] leading-snug font-bold text-fg">
                        {product.name}
                      </h2>
                      {product.shortDescription && (
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-fg-muted">
                          {product.shortDescription}
                        </p>
                      )}

                      <div className="mt-auto pt-4">
                        {isRental ? (
                          <p className="text-lg font-extrabold text-fg">
                            {formatCurrency(product.rentalPricePerDay)}
                            <span className="text-[12px] font-medium text-fg-subtle">/day</span>
                          </p>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <p className="text-lg font-extrabold text-fg">
                              {formatCurrency(product.price)}
                            </p>
                            {discount > 0 && (
                              <p className="text-[12.5px] text-fg-subtle line-through">
                                {formatCurrency(product.mrp)}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
                          {product.warrantyMonths > 0 && (
                            <span className="inline-flex items-center gap-1 font-semibold text-success">
                              <ShieldCheck className="size-3.5" />
                              {product.warrantyMonths}-month warranty
                            </span>
                          )}
                          <span
                            className={cn(
                              'font-semibold',
                              product.stockCount > 3
                                ? 'text-fg-muted'
                                : product.stockCount > 0
                                  ? 'text-warning'
                                  : 'text-danger'
                            )}
                          >
                            {product.stockCount > 3
                              ? 'In stock'
                              : product.stockCount > 0
                                ? `Only ${product.stockCount} left`
                                : 'Out of stock'}
                          </span>
                        </div>

                        {canBuy(product) ? (
                          <AddToCart product={product} className="mt-3.5 w-full" />
                        ) : (
                          <Button
                            href={`/contact?product=${encodeURIComponent(product.name)}`}
                            variant="secondary"
                            size="sm"
                            className="mt-3.5 w-full"
                          >
                            {isRental ? 'Enquire to rent' : 'Enquire now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}

        <Pagination page={page} pages={pages} onChange={setPage} className="mt-12" />
        <ViewCartBar className="bottom-[calc(var(--safe-bottom)+6.5rem)] lg:bottom-6" />

        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-8 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
            <PackageSearch className="size-6" />
          </span>
          <h2 className="text-xl font-bold text-fg">Can&apos;t find what you need?</h2>
          <p className="max-w-lg text-[14px] text-fg-muted">
            We source hardware daily from Chennai&apos;s largest distributors. Tell us your budget
            and requirement — we will quote within a few hours.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/contact">
              <Sparkles className="size-4" />
              Request a quote
            </Button>
            <Button href={`tel:${site.primaryPhone}`} variant="outline">
              <Phone className="size-4" />
              {site.phones[0]}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
