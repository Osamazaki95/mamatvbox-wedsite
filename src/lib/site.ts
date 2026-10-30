'use client';

import { useEffect, useState } from 'react';
import { configApi, platformsApi } from './api';
import type { Platform, SiteConfig } from './api/types';
import { defaultConfig } from './site-defaults';

/*
 * Site config and the platform list are needed by the navbar, footer and most pages.
 * Both are fetched once per page load and shared by every component.
 */

let configPromise: Promise<SiteConfig> | null = null;
let configCache: SiteConfig | null = null;

export function loadSiteConfig(): Promise<SiteConfig> {
  configPromise ??= configApi.get()
    .then((c) => ({ ...defaultConfig, ...c, home: { ...defaultConfig.home, ...c.home }, taxonomy: { ...defaultConfig.taxonomy, ...c.taxonomy } }))
    .catch(() => defaultConfig)
    .then((c) => (configCache = c));
  return configPromise;
}

/** null until loaded — callers hide config-dependent UI meanwhile so hidden features never flash. */
export function useSiteConfig(): SiteConfig | null {
  const [c, setC] = useState<SiteConfig | null>(configCache);
  useEffect(() => {
    let alive = true;
    loadSiteConfig().then((v) => alive && setC(v));
    return () => { alive = false; };
  }, []);
  return c;
}

let platformsPromise: Promise<Platform[]> | null = null;
let platformsCache: Platform[] | null = null;
const registry = new Map<string, Platform>();

export function loadPlatforms(): Promise<Platform[]> {
  platformsPromise ??= platformsApi.list()
    .catch(() => [] as Platform[])
    .then((list) => {
      platformsCache = list;
      list.forEach((p) => registry.set(p.id, p));
      return list;
    });
  return platformsPromise;
}

/** Active platforms (featured first). [] until loaded. */
export function usePlatformList(): Platform[] {
  const [list, setList] = useState<Platform[]>(platformsCache ?? []);
  useEffect(() => {
    let alive = true;
    loadPlatforms().then((l) => alive && setList(l));
    return () => { alive = false; };
  }, []);
  return list;
}

/** Platform by id from the shared list (undefined until loaded / unknown id). */
export const platformById = (id: string): Platform | undefined => registry.get(id);
