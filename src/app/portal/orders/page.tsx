'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderList } from '@/components/shop/order-view';

export default function MyOrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-fg app:hidden">My orders</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            Everything you bought from the Renderways shop, with live delivery status.
          </p>
        </div>
        <Button href="/products">
          <ShoppingBag className="size-4" />
          Shop
        </Button>
      </div>

      <OrderList
        basePath="/portal/orders"
        emptyAction={
          <Button href="/products">
            <ShoppingBag className="size-4" />
            Browse the shop
          </Button>
        }
      />
    </div>
  );
}
