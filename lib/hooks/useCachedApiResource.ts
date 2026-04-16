'use client';

import { useEffect, useState } from 'react';

type CacheRecord<T> = {
  data: T;
  updatedAt: number;
};

interface UseCachedApiResourceOptions<T> {
  cacheKey: string;
  url: string;
  fallbackData: T;
  maxAgeMs?: number;
  staleWhileRevalidateMs?: number;
}

function loadFromCache<T>(cacheKey: string): CacheRecord<T> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(cacheKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CacheRecord<T>;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function saveToCache<T>(cacheKey: string, data: T) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: CacheRecord<T> = {
    data,
    updatedAt: Date.now(),
  };

  localStorage.setItem(cacheKey, JSON.stringify(payload));
}

export function useCachedApiResource<T>({
  cacheKey,
  url,
  fallbackData,
  maxAgeMs = 60_000,
  staleWhileRevalidateMs = 86_400_000,
}: UseCachedApiResourceOptions<T>) {
  const [data, setData] = useState<T>(fallbackData);
  const [cached, setCached] = useState<CacheRecord<T> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedData = loadFromCache<T>(cacheKey);
    setCached(cachedData);
    if (cachedData?.data) {
      setData(cachedData.data);
    }
    setHydrated(true);
  }, [cacheKey]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const now = Date.now();
    const age = cached ? now - cached.updatedAt : Number.POSITIVE_INFINITY;

    const shouldUseOnlyCache = age < maxAgeMs;
    const shouldUseCacheThenRevalidate = age >= maxAgeMs && age < staleWhileRevalidateMs;

    if (shouldUseOnlyCache) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    if (!shouldUseCacheThenRevalidate) {
      setLoading(true);
    }

    async function fetchFreshData() {
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }

        const freshData = (await response.json()) as T;
        setData(freshData);
        saveToCache(cacheKey, freshData);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchFreshData();

    return () => controller.abort();
  }, [cacheKey, cached, hydrated, maxAgeMs, staleWhileRevalidateMs, url]);

  return {
    data,
    loading,
    error,
  };
}
