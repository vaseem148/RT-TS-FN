'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/misc';

/**
 * Recharts is ~180 kB of the dashboard bundle and is never needed above the
 * fold, so it is code-split out of the initial payload. Every consumer keeps
 * importing from `@/components/dashboard/charts` — only the loading changes.
 */
const placeholder = (height: number) => () => (
  <Skeleton className="w-full rounded-xl" style={{ height }} />
);

export const TrendChart = dynamic(
  () => import('./charts-impl').then((m) => m.TrendChart),
  { ssr: false, loading: placeholder(260) }
);

export const StatusDonut = dynamic(
  () => import('./charts-impl').then((m) => m.StatusDonut),
  { ssr: false, loading: placeholder(260) }
);

export const CategoryBars = dynamic(
  () => import('./charts-impl').then((m) => m.CategoryBars),
  { ssr: false, loading: placeholder(280) }
);
