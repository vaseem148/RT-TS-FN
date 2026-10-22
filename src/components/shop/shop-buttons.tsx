'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { canBuy, useCart } from '@/components/providers/cart-provider';

/** "Add to cart", turning into a − qty + stepper once the product is in the cart. */
export function AddToCart({
  product,
  size = 'md',
  className,
}: {
  product: Product;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { add, setQty, qtyOf } = useCart();
  const qty = qtyOf(product._id);
  const height = size === 'sm' ? 'h-8' : 'h-10';

  if (!canBuy(product)) return null;

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          add(product);
          toast.success(`${product.name} added to cart`);
        }}
        className={cn(
          height,
          'inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3.5 text-[13px] font-bold text-brand-fg shadow-md shadow-brand/25 transition-transform active:scale-95',
          className
        )}
      >
        <Plus className="size-4" />
        Add
      </button>
    );
  }

  return (
    <div
      className={cn(
        height,
        'inline-flex items-center justify-between gap-1 rounded-xl border border-brand/40 bg-brand-soft px-1 text-brand',
        className
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        aria-label={`One less ${product.name}`}
        onClick={() => setQty(product._id, qty - 1)}
        className="grid size-7 place-items-center rounded-lg transition-transform active:scale-90"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-6 text-center text-[14px] font-extrabold" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        aria-label={`One more ${product.name}`}
        onClick={() => setQty(product._id, qty + 1)}
        className="grid size-7 place-items-center rounded-lg transition-transform active:scale-90"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Cart icon with a count badge; links to /cart. */
export function CartButton({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} item${count > 1 ? 's' : ''}` : 'Cart'}
      className={cn(
        'relative grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-fg-muted transition-all hover:text-brand active:scale-90',
        className
      )}
    >
      <ShoppingCart className={cn('size-[18px]', iconClassName)} />
      {count > 0 && (
        <span
          key={count}
          className="absolute -top-1 -right-1 grid min-w-[18px] animate-[pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)] place-items-center rounded-full bg-brand px-1 text-[10px] leading-[18px] font-extrabold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/** A floating "View cart" bar for the shop page when the cart has items. */
export function ViewCartBar({ className }: { className?: string }) {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <Link
      href="/cart"
      className={cn(
        'page-enter fixed inset-x-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-linear-90 from-accent to-brand px-4 py-3 text-white shadow-xl shadow-brand/30 transition-transform active:scale-[0.98]',
        className
      )}
    >
      <ShoppingBag className="size-5" />
      <span className="flex-1 text-[14px] font-bold">
        {count} item{count > 1 ? 's' : ''} ·{' '}
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(subtotal)}
      </span>
      <span className="text-[14px] font-extrabold">View cart →</span>
    </Link>
  );
}
