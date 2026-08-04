'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from './api';

interface Entry {
  data: unknown;
  at: number;
}

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL = 60_000;

/** Drops cached responses so the next read refetches. */
export function invalidate(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

/**
 * Stale-while-revalidate fetching.
 *
 * A cached response renders immediately — so navigating back to a page you
 * have already visited paints instantly instead of flashing skeletons — and a
 * background refetch keeps it current. Concurrent callers with the same key
 * share one request.
 */
export function useApi<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  { ttl = DEFAULT_TTL, enabled = true }: { ttl?: number; enabled?: boolean } = {}
) {
  // Held in a ref so callers can pass an inline arrow without re-triggering.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const initial = key ? (cache.get(key)?.data as T | undefined) : undefined;
  const [data, setData] = useState<T | undefined>(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(initial === undefined && enabled && !!key);
  /** True during a background refresh that already has data on screen. */
  const [validating, setValidating] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (force = false) => {
      if (!key || !enabled) return;

      const entry = cache.get(key);
      if (entry) {
        setData(entry.data as T);
        setLoading(false);
        if (!force && Date.now() - entry.at < ttl) return;
        setValidating(true);
      } else {
        setLoading(true);
      }

      let request = force ? undefined : inflight.get(key);
      if (!request) {
        request = fetcherRef
          .current()
          .then((result) => {
            cache.set(key, { data: result, at: Date.now() });
            return result;
          })
          .finally(() => inflight.delete(key));
        inflight.set(key, request);
      }

      try {
        const result = (await request) as T;
        if (!mounted.current) return;
        setData(result);
        setError('');
      } catch (err) {
        if (!mounted.current) return;
        setError(toApiError(err).message);
      } finally {
        if (mounted.current) {
          setLoading(false);
          setValidating(false);
        }
      }
    },
    [key, ttl, enabled]
  );

  useEffect(() => {
    void run();
  }, [run]);

  const refresh = useCallback(async () => {
    setValidating(true);
    await run(true);
  }, [run]);

  return {
    data,
    error,
    /** True only while there is nothing to show — a background refresh keeps stale data visible. */
    loading,
    validating,
    refresh,
    setData,
  };
}
