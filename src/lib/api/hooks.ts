'use client';

import { useEffect, useState } from 'react';
import { meApi, metaApi, platformsApi } from '.';
import type { Country, Platform, UserProfile } from './types';

/** Minimal client-side data hook. Swap for SWR / React Query if you prefer. */
export function useResource<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    loader()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error };
}

export const usePlatforms = () => useResource<Platform[]>(platformsApi.list, []).data;
export const useCountries = () => useResource<Country[]>(metaApi.countries, []).data;
export const useProfile = () => useResource<UserProfile | null>(meApi.profile, null).data;
