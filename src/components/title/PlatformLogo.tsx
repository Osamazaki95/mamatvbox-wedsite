'use client';

import { useState } from 'react';
import type { Platform } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'h-5 w-5 rounded-full text-[9px]',
  sm: 'h-8 w-8 rounded-lg text-sm',
  md: 'h-11 w-11 rounded-xl text-base',
  lg: 'h-14 w-14 rounded-2xl text-xl',
} as const;

/**
 * The platform's logo uploaded from the dashboard (or its TMDB logo).
 * Falls back to the first letter on the platform colour when there is no logo or it fails to load.
 */
export function PlatformLogo({ platform, size = 'md', className }: {
  platform: Pick<Platform, 'name' | 'color'> & Partial<Pick<Platform, 'logo' | 'nameAr'>>;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const box = cn('relative grid shrink-0 place-items-center overflow-hidden font-bold', sizes[size], className);
  const color = platform.color || '#4FE3D0';

  if (platform.logo && !broken) {
    // TMDB logos are full square tiles; uploaded logos are usually transparent marks that need padding.
    const tile = platform.logo.includes('image.tmdb.org');
    return (
      <span className={cn(box, tile ? 'bg-panel' : 'bg-white ring-1 ring-line/60')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={platform.logo} alt={platform.nameAr || platform.name} loading="lazy" onError={() => setBroken(true)} className={cn('h-full w-full', tile ? 'object-cover' : 'object-contain p-[14%]')} />
      </span>
    );
  }
  return (
    <span className={box} style={{ background: `${color}22`, color }} aria-hidden>
      {(platform.name || platform.nameAr || '?').trim()[0]?.toUpperCase()}
    </span>
  );
}
