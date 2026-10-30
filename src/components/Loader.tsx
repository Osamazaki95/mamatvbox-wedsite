'use client';

import { useEffect, useState } from 'react';

/** Loads data in the browser (static hosting). Errors bubble to app/error.tsx. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    setData(undefined);
    fn().then((d) => { if (alive) setData(d); }).catch((e) => { if (alive) setError(e); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  if (error) throw error;
  return data;
}

/** Reads the slug from the real browser URL (/title/<slug>/) — works with the Apache rewrite. */
export function useUrlSlug(section: 'title' | 'person'): string {
  const [slug, setSlug] = useState('');
  useEffect(() => {
    const read = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const i = parts.indexOf(section);
      setSlug(decodeURIComponent(parts[i + 1] ?? ''));
    };
    read();
    window.addEventListener('popstate', read);
    const id = setInterval(read, 400);
    return () => { window.removeEventListener('popstate', read); clearInterval(id); };
  }, [section]);
  return slug === '_' ? '' : slug;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10">
      <div className="skeleton h-40 rounded-3xl sm:h-48" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />)}
      </div>
    </div>
  );
}
