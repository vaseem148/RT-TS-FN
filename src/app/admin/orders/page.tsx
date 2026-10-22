'use client';

import { OrderList } from '@/components/shop/order-view';

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-fg">Shop orders</h1>
        <p className="mt-1 text-[13.5px] text-fg-muted">
          Confirm, dispatch and deliver orders. Payment is collected on delivery.
        </p>
      </div>
      <OrderList basePath="/admin/orders" admin />
    </div>
  );
}
