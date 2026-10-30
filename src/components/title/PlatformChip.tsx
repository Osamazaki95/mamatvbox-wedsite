'use client';

import { BadgeCheck } from 'lucide-react';
import type { PlatformId } from '@/lib/api/types';
import { platformById, usePlatformList } from '@/lib/site';
import { cn } from '@/lib/utils';
import { PlatformLogo } from './PlatformLogo';

/** Fallback names for the original platforms (before the platform list loads). */
const names: Record<PlatformId, string> = {
  shahid: 'Shahid VIP', watchit: 'Watch It', netflix: 'Netflix', osn: '+OSN', prime: 'Prime Video',
  yango: 'Yango Play', appletv: '+Apple TV', starzplay: 'STARZPLAY', youtube: 'YouTube Movies',
};

export const platformName = (id: PlatformId) => platformById(id)?.name || names[id] || id;

export function PlatformChip({ id, withIcon = true, className, href }: { id: PlatformId; withIcon?: boolean; className?: string; href?: string }) {
  usePlatformList(); // re-render once names/logos arrive
  const p = platformById(id);
  const body = (
    <>
      {withIcon && <PlatformLogo platform={p ?? { name: platformName(id), color: '#9CA3AF' }} size="xs" />}
      {platformName(id)}
    </>
  );
  const cls = cn('inline-flex items-center gap-2 rounded-full border border-line/70 bg-surface py-1.5 pe-4 ps-1.5 text-xs font-semibold transition hover:-translate-y-0.5 hover:border-teal/50 hover:text-ink', className);
  return href ? <a href={href} className={cls}>{body}</a> : <span className={cls}>{body}</span>;
}

export function VerifiedMark() {
  return <BadgeCheck className="h-5 w-5 text-teal" />;
}
