'use client';

import { use } from 'react';
import { OrderDetail } from '@/components/shop/order-view';

export default function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetail orderId={id} basePath="/admin/orders" admin />;
}
