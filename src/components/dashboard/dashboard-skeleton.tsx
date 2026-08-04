import { Skeleton } from '@/components/ui/misc';

/**
 * Route-level placeholder so navigating into a dashboard paints structure
 * immediately instead of leaving the previous page frozen while the route
 * chunk loads.
 */
export function DashboardSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: tiles }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
