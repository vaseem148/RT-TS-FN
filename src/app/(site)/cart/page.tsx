'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { MapPin, Minus, Phone, Plus, Repeat2, ShoppingBag, Trash2, Wrench } from 'lucide-react';
import { orderApi } from '@/lib/endpoints';
import { toApiError } from '@/lib/api';
import { invalidate } from '@/lib/use-api';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { useCart } from '@/components/providers/cart-provider';
import { ArtTile, artForProduct } from '@/components/app/service-art';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/misc';

function Toggle({
  checked,
  onChange,
  icon,
  title,
  body,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors',
        checked ? 'border-brand/50 bg-brand-soft' : 'border-line bg-surface'
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-fg">{title}</span>
        <span className="block text-[12.5px] leading-relaxed text-fg-muted">{body}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-[var(--brand)]"
      />
    </label>
  );
}

/** The shop cart and checkout: pay on delivery, delivered (and set up if asked) by our team. */
export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, count, subtotal, setQty, remove, clear } = useCart();

  const [installation, setInstallation] = useState(false);
  const [exchange, setExchange] = useState(false);
  const [exchangeNote, setExchangeNote] = useState('');
  const [address, setAddress] = useState({ line1: '', city: 'Chennai', pincode: '', landmark: '' });
  const [phone, setPhone] = useState('');
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Start from the address and phone saved on the profile.
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      line1: prev.line1 || user.address?.line1 || '',
      city: user.address?.city || prev.city,
      pincode: prev.pincode || user.address?.pincode || '',
      landmark: prev.landmark || user.address?.landmark || '',
    }));
    setPhone((prev) => prev || user.phone);
  }, [user]);

  const placeOrder = async () => {
    if (!user) {
      router.push('/login?next=/cart');
      return;
    }
    if (!address.line1.trim()) {
      setErrors({ 'address.line1': 'Where should we deliver?' });
      return;
    }
    setPlacing(true);
    setErrors({});
    try {
      const order = await orderApi.create({
        items: lines.map((line) => ({ productId: line.productId, qty: line.qty })),
        address,
        phone,
        installation,
        exchange: { wanted: exchange, note: exchangeNote },
      });
      clear();
      invalidate('orders:');
      invalidate('products');
      router.push(`/portal/orders/${order._id}?placed=1`);
    } catch (error) {
      const apiError = toApiError(error);
      setErrors(apiError.details || {});
      toast.error(apiError.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Shop"
        breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Cart' }]}
        title="Your cart"
        description="Pay on delivery by UPI, card or cash. Our team delivers, and sets it up if you ask."
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 app:py-6">
        {count === 0 ? (
          <EmptyState
            icon="ShoppingBag"
            title="Your cart is empty"
            description="Add a computer, laptop or accessory from the shop."
            action={<Button href="/products">Go to shop</Button>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-4">
              <ul className="stagger space-y-3">
                {lines.map((line) => (
                  <li key={line.productId}>
                    <Card className="flex items-center gap-3.5 p-3.5">
                      <ArtTile kind={artForProduct(line)} size={64} />
                      <div className="min-w-0 flex-1">
                        {line.brand && (
                          <p className="text-[11px] font-bold tracking-wider text-fg-subtle uppercase">{line.brand}</p>
                        )}
                        <p className="line-clamp-2 text-[14px] leading-snug font-bold text-fg">{line.name}</p>
                        <p className="mt-1 text-[14px] font-extrabold text-fg">{formatCurrency(line.price * line.qty)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="inline-flex h-9 items-center gap-1 rounded-xl border border-line px-1">
                          <button
                            type="button"
                            aria-label={`One less ${line.name}`}
                            onClick={() => setQty(line.productId, line.qty - 1)}
                            className="grid size-7 place-items-center rounded-lg text-fg active:scale-90"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="min-w-6 text-center text-[14px] font-extrabold text-fg">{line.qty}</span>
                          <button
                            type="button"
                            aria-label={`One more ${line.name}`}
                            disabled={line.qty >= line.max}
                            onClick={() => setQty(line.productId, line.qty + 1)}
                            className="grid size-7 place-items-center rounded-lg text-fg active:scale-90 disabled:opacity-40"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>

              <Toggle
                checked={installation}
                onChange={setInstallation}
                icon={<Wrench className="size-5" />}
                title="Install and test on delivery"
                body="Our engineer sets it up and checks everything works before leaving."
              />
              <Toggle
                checked={exchange}
                onChange={setExchange}
                icon={<Repeat2 className="size-5" />}
                title="Exchange my old laptop or desktop"
                body="Our engineer values it during the delivery visit; the amount comes off your bill."
              />
              {exchange && (
                <Input
                  label="Old device"
                  placeholder="e.g. HP 15 laptop, 2019, working"
                  value={exchangeNote}
                  onChange={(event) => setExchangeNote(event.target.value)}
                  maxLength={300}
                />
              )}

              <Card className="space-y-4 p-5">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-fg">
                  <MapPin className="size-4 text-brand" />
                  Deliver to
                </h2>
                {user ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Address"
                      required
                      containerClassName="sm:col-span-2"
                      placeholder="Door no., street, area"
                      value={address.line1}
                      onChange={(event) => setAddress((prev) => ({ ...prev, line1: event.target.value }))}
                      error={errors['address.line1']}
                    />
                    <Input
                      label="City"
                      value={address.city}
                      onChange={(event) => setAddress((prev) => ({ ...prev, city: event.target.value }))}
                    />
                    <Input
                      label="Pincode"
                      inputMode="numeric"
                      value={address.pincode}
                      onChange={(event) => setAddress((prev) => ({ ...prev, pincode: event.target.value }))}
                    />
                    <Input
                      label="Landmark"
                      placeholder="Optional"
                      value={address.landmark}
                      onChange={(event) => setAddress((prev) => ({ ...prev, landmark: event.target.value }))}
                    />
                    <Input
                      label="Phone for delivery"
                      type="tel"
                      icon={<Phone className="size-4" />}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </div>
                ) : (
                  <p className="text-[13.5px] text-fg-muted">
                    <Link href="/login?next=/cart" className="font-bold text-brand">
                      Sign in
                    </Link>{' '}
                    or{' '}
                    <Link href="/register" className="font-bold text-brand">
                      create an account
                    </Link>{' '}
                    to place your order — your cart is kept.
                  </p>
                )}
              </Card>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="space-y-3 p-5">
                <h2 className="text-[16px] font-bold text-fg">Bill summary</h2>
                <dl className="space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">
                      Items ({count})
                    </dt>
                    <dd className="font-semibold text-fg">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-fg-muted">Doorstep delivery</dt>
                    <dd className="font-semibold text-success">Free</dd>
                  </div>
                  {installation && (
                    <div className="flex justify-between">
                      <dt className="text-fg-muted">Install and test</dt>
                      <dd className="font-semibold text-fg">On the visit</dd>
                    </div>
                  )}
                  {exchange && (
                    <div className="flex justify-between">
                      <dt className="text-fg-muted">Exchange value</dt>
                      <dd className="font-semibold text-fg">Valued on delivery</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-line pt-3 text-[16px]">
                    <dt className="font-bold text-fg">To pay</dt>
                    <dd className="font-extrabold text-fg">{formatCurrency(subtotal)}</dd>
                  </div>
                </dl>
                <p className="text-[12px] leading-relaxed text-fg-subtle">
                  Pay on delivery by UPI, card or cash. We call you to confirm the delivery time.
                </p>
                <Button
                  size="lg"
                  loading={placing}
                  onClick={() => void placeOrder()}
                  className="w-full app:bg-linear-90 app:from-accent app:to-brand"
                >
                  <ShoppingBag className="size-4" />
                  {user ? 'Place order' : 'Sign in to order'}
                </Button>
              </Card>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
