'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Clock,
  Laptop,
  Mail,
  MapPin,
  Phone,
  Repeat2,
  Search,
  ShoppingBag,
  User as UserIcon,
  Wallet,
  Wrench,
} from 'lucide-react';
import { orderApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate, useApi } from '@/lib/use-api';
import type { Order, OrderStatus } from '@/lib/types';
import { cn, formatCurrency, formatDateTime, timeAgo } from '@/lib/utils';
import { ArtTile, artForProduct } from '@/components/app/service-art';
import { SuccessCard } from '@/components/tickets/ticket-created';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/field';
import { EmptyState, Modal, Pagination, Skeleton, Spinner } from '@/components/ui/misc';
import { ORDER_NEXT, ORDER_STATUS_LABEL, OrderStatusBadge, OrderTimeline } from './order-ui';

const STATUS_TABS = [
  { value: 'active', label: 'Active' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: '', label: 'All' },
];

const CUSTOMER_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'On the way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** Categories that become a "My devices" entry once delivered (mirrors the API). */
const BECOMES_DEVICE = ['laptop', 'desktop', 'cctv', 'networking'];

function customerOf(order: Order) {
  return typeof order.customer === 'string' ? null : order.customer;
}

function itemSummary(order: Order) {
  const [first, ...rest] = order.items;
  if (!first) return '';
  const more = rest.reduce((sum, item) => sum + item.qty, 0);
  return `${first.qty > 1 ? `${first.qty} × ` : ''}${first.name}${more ? ` + ${more} more` : ''}`;
}

export function OrderCard({ order, basePath, admin }: { order: Order; basePath: string; admin?: boolean }) {
  const customer = customerOf(order);
  const first = order.items[0];
  return (
    <Link
      href={`${basePath}/${order._id}`}
      className="group block rounded-2xl border border-line bg-surface p-4 transition-all duration-300 active:scale-[0.985] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/8 sm:p-5"
    >
      <div className="flex items-start gap-4">
        {first && <ArtTile kind={artForProduct(first)} size={48} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="font-mono text-[12px] font-bold text-fg-subtle">{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <h3 className="mt-1.5 truncate text-[15px] font-bold text-fg transition-colors group-hover:text-brand">
            {itemSummary(order)}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-fg-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {timeAgo(order.createdAt)}
            </span>
            {admin && customer && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-fg-muted">
                <UserIcon className="size-3.5 text-brand" />
                {customer.name}
              </span>
            )}
            {order.address?.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {order.address.city}
              </span>
            )}
            <span className="ml-auto text-[14px] font-extrabold text-fg">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OrderList({
  basePath,
  admin,
  emptyAction,
}: {
  basePath: string;
  admin?: boolean;
  emptyAction?: React.ReactNode;
}) {
  const [status, setStatus] = useState(admin ? 'active' : '');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, error, loading } = useApi(
    `orders:${status}:${query}:${page}`,
    () => orderApi.list({ status: status || undefined, search: query || undefined, page, limit: 10 }),
    { ttl: 20_000 }
  );

  const orders = data?.orders;
  const pages = data?.pagination.pages ?? 1;
  const total = data?.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {admin && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
            className="relative"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order number or product…"
              className="h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-sm text-fg outline-none transition-all placeholder:text-fg-subtle focus:border-brand focus:ring-4 focus:ring-brand/12"
              aria-label="Search orders"
            />
          </form>
        )}
        <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {(admin ? STATUS_TABS : CUSTOMER_TABS).map((tab) => (
            <button
              key={tab.value || 'all'}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={cn(
                'shrink-0 rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors',
                status === tab.value
                  ? 'border-brand bg-brand text-brand-fg'
                  : 'border-line bg-surface text-fg-muted hover:border-brand/45 hover:text-brand'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {orders && orders.length > 0 && (
        <p className="text-[12.5px] text-fg-muted">
          <span className="font-bold text-fg">{total}</span> order{total === 1 ? '' : 's'}
        </p>
      )}

      {loading || !orders ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface">
          <EmptyState
            icon="Package"
            title="No orders here"
            description={
              status || query
                ? 'No orders match this filter. Try a different status.'
                : 'Orders from the shop show up here, with live delivery status.'
            }
            action={emptyAction}
          />
        </div>
      ) : (
        <div className="stagger flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} basePath={basePath} admin={admin} />
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onChange={setPage} className="mt-2" />
    </div>
  );
}

function InfoRow({ icon: RowIcon, label, children }: { icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <RowIcon className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{label}</p>
        <div className="mt-0.5 text-[13.5px] font-medium break-words text-fg">{children}</div>
      </div>
    </div>
  );
}

export function OrderDetail({ orderId, basePath, admin }: { orderId: string; basePath: string; admin?: boolean }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [justPlaced, setJustPlaced] = useState(false);
  const [next, setNext] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  // The cart lands here with ?placed=1. Celebrate once, then drop the flag.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('placed') !== '1') return;
    setJustPlaced(true);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  useEffect(() => {
    let current = true;
    orderApi
      .get(orderId)
      .then((data) => current && (setOrder(data), setError('')))
      .catch((err) => current && setError(toApiError(err).message));
    return () => {
      current = false;
    };
  }, [orderId]);

  const applyUpdate = useCallback((updated: Order) => {
    setOrder(updated);
    invalidate('orders:');
    invalidate('products');
    if (updated.status === 'delivered') invalidate('devices:');
  }, []);

  const moveTo = async () => {
    if (!next) return;
    setBusy(true);
    try {
      applyUpdate(await orderApi.setStatus(orderId, next, note.trim() || undefined));
      toast.success(`Order ${ORDER_STATUS_LABEL[next].toLowerCase()}`);
      setNext(null);
      setNote('');
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      applyUpdate(await orderApi.cancel(orderId));
      toast.success('Order cancelled');
      setConfirmCancel(false);
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon="SearchX"
        title="Order not available"
        description={error}
        action={
          <Button href={basePath} variant="outline">
            Back to orders
          </Button>
        }
      />
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    );
  }

  const customer = customerOf(order);
  const transitions = admin ? ORDER_NEXT[order.status] : [];
  const addsDevices =
    !admin && order.status === 'delivered' && order.items.some((item) => BECOMES_DEVICE.includes(item.category));
  const address = [order.address?.line1, order.address?.landmark, order.address?.city, order.address?.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={basePath}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-fg-muted transition-colors hover:text-brand app:hidden"
      >
        <ArrowLeft className="size-4" />
        All orders
      </Link>

      {justPlaced && (
        <SuccessCard title="Order placed!" onClose={() => setJustPlaced(false)}>
          Your order number is <span className="font-mono font-bold text-fg">{order.orderNumber}</span>. We will call
          you to confirm the delivery time. Pay on delivery.
        </SuccessCard>
      )}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-fg-subtle">{order.orderNumber}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <h1 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg sm:text-2xl">
              {formatCurrency(order.total)}
            </h1>
            <p className="mt-1 text-[12.5px] text-fg-subtle">
              Placed {formatDateTime(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.qty, 0)} item
              {order.items.reduce((sum, item) => sum + item.qty, 0) === 1 ? '' : 's'} · Pay on delivery
            </p>
          </div>
        </div>

        {(transitions.length > 0 || (!admin && order.status === 'placed')) && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
            {transitions.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === 'delivered' ? 'success' : status === 'cancelled' ? 'danger' : 'outline'}
                onClick={() => setNext(status)}
              >
                {status === 'cancelled' ? 'Cancel order' : `Mark ${ORDER_STATUS_LABEL[status].toLowerCase()}`}
              </Button>
            ))}
            {!admin && order.status === 'placed' && (
              <Button size="sm" variant="outline" onClick={() => setConfirmCancel(true)}>
                Cancel order
              </Button>
            )}
          </div>
        )}
      </Card>

      {addsDevices && (
        <Link
          href="/portal/devices"
          className="page-enter flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand-soft p-4 transition-transform active:scale-[0.98]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Laptop className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold text-fg">Added to My devices</span>
            <span className="block text-[12.5px] text-fg-muted">Book a repair or service for it in one tap.</span>
          </span>
          <span className="text-[13px] font-bold text-brand">Open →</span>
        </Link>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="text-[15px] font-bold text-fg">Items</h2>
            <ul className="mt-3 divide-y divide-line">
              {order.items.map((item, index) => (
                <li key={`${item.product}-${index}`} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                  <ArtTile kind={artForProduct(item)} size={52} />
                  <div className="min-w-0 flex-1">
                    {item.brand && (
                      <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{item.brand}</p>
                    )}
                    <p className="line-clamp-2 text-[14px] leading-snug font-bold text-fg">{item.name}</p>
                    <p className="text-[12.5px] text-fg-muted">
                      {item.qty} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="text-[14px] font-extrabold text-fg">{formatCurrency(item.qty * item.price)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-fg-muted">Items</dt>
                <dd className="font-semibold text-fg">{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">Doorstep delivery</dt>
                <dd className={cn('font-semibold', order.deliveryFee ? 'text-fg' : 'text-success')}>
                  {order.deliveryFee ? formatCurrency(order.deliveryFee) : 'Free'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-[16px]">
                <dt className="font-bold text-fg">{order.status === 'delivered' ? 'Paid' : 'To pay on delivery'}</dt>
                <dd className="font-extrabold text-fg">{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-[15px] font-bold text-fg">Delivery status</h2>
            <OrderTimeline order={order} />
            {order.history.some((entry) => entry.note) && (
              <ul className="mt-2 space-y-2 border-t border-line pt-4">
                {order.history
                  .filter((entry) => entry.note)
                  .map((entry, index) => (
                    <li key={index} className="text-[13px] text-fg-muted">
                      <span className="font-bold text-fg">{ORDER_STATUS_LABEL[entry.status]}:</span> {entry.note}
                    </li>
                  ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          {admin && customer && (
            <Card className="space-y-4 p-5">
              <h2 className="text-[15px] font-bold text-fg">Customer</h2>
              <InfoRow icon={UserIcon} label="Name">
                {customer.name}
              </InfoRow>
              {customer.phone && (
                <InfoRow icon={Phone} label="Phone">
                  <a href={`tel:${customer.phone}`} className="text-brand">
                    {customer.phone}
                  </a>
                </InfoRow>
              )}
              {customer.email && (
                <InfoRow icon={Mail} label="Email">
                  {customer.email}
                </InfoRow>
              )}
            </Card>
          )}

          <Card className="space-y-4 p-5">
            <h2 className="text-[15px] font-bold text-fg">Delivery</h2>
            <InfoRow icon={MapPin} label="Deliver to">
              {address || '—'}
            </InfoRow>
            {order.phone && (
              <InfoRow icon={Phone} label="Phone for delivery">
                {admin ? (
                  <a href={`tel:${order.phone}`} className="text-brand">
                    {order.phone}
                  </a>
                ) : (
                  order.phone
                )}
              </InfoRow>
            )}
            <InfoRow icon={Wallet} label="Payment">
              Pay on delivery — UPI, card or cash
            </InfoRow>
            {order.installation && (
              <InfoRow icon={Wrench} label="Installation">
                Install and test on delivery
              </InfoRow>
            )}
            {order.exchange?.wanted && (
              <InfoRow icon={Repeat2} label="Exchange">
                {order.exchange.note || 'Old device to be valued on delivery'}
              </InfoRow>
            )}
            {order.notes && (
              <InfoRow icon={ShoppingBag} label="Notes">
                {order.notes}
              </InfoRow>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={!!next}
        onClose={() => setNext(null)}
        title={next === 'cancelled' ? 'Cancel this order?' : `Mark ${next ? ORDER_STATUS_LABEL[next].toLowerCase() : ''}`}
        description={
          next === 'cancelled'
            ? 'Items go back into stock and the customer is told.'
            : next === 'delivered'
              ? 'Computers, CCTV and network gear are added to the customer’s devices.'
              : 'The customer is told by email and WhatsApp.'
        }
        size="sm"
      >
        <div className="space-y-4">
          <Textarea
            label="Note for the customer"
            placeholder={next === 'out_for_delivery' ? 'e.g. Arriving by 4 pm, call 98xxxxxx' : 'Optional'}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={300}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNext(null)}>
              Back
            </Button>
            <Button
              variant={next === 'cancelled' ? 'danger' : next === 'delivered' ? 'success' : 'primary'}
              loading={busy}
              onClick={() => void moveTo()}
            >
              {next === 'cancelled' ? 'Cancel order' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel this order?"
        description="You can cancel until we confirm it. You can always order again."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
            Keep order
          </Button>
          <Button variant="danger" loading={busy} onClick={() => void cancel()}>
            Cancel order
          </Button>
        </div>
      </Modal>
    </div>
  );
}
