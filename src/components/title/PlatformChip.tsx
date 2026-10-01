import { BadgeCheck, Clapperboard, MonitorPlay, PlayCircle, Star, Tv } from 'lucide-react';
import type { PlatformId } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const names: Record<PlatformId, string> = {
  shahid: 'Shahid VIP', watchit: 'Watch It', netflix: 'Netflix', osn: '+OSN', prime: 'Prime Video',
  yango: 'Yango Play', appletv: '+Apple TV', starzplay: 'STARZPLAY', youtube: 'YouTube Movies',
};

const icons: Record<PlatformId, typeof Tv> = {
  shahid: Clapperboard, watchit: PlayCircle, netflix: MonitorPlay, osn: MonitorPlay,
  prime: MonitorPlay, yango: Clapperboard, appletv: Tv, starzplay: Star, youtube: MonitorPlay,
};
const iconTone: Record<PlatformId, string> = {
  shahid: 'text-teal', watchit: 'text-gold', netflix: 'text-danger', osn: 'text-ink',
  prime: 'text-muted', yango: 'text-teal', appletv: 'text-ink', starzplay: 'text-gold', youtube: 'text-danger',
};

export const platformName = (id: PlatformId) => names[id] ?? id;

export function PlatformChip({ id, withIcon = true, className }: { id: PlatformId; withIcon?: boolean; className?: string }) {
  const Icon = icons[id] ?? Tv;
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border border-line/70 bg-surface px-4 py-1.5 text-xs font-semibold transition hover:border-teal/50 hover:-translate-y-0.5', className)}>
      {platformName(id)}
      {withIcon && <Icon className={cn('h-4 w-4', iconTone[id] ?? 'text-muted')} />}
    </span>
  );
}

export function VerifiedMark() {
  return <BadgeCheck className="h-5 w-5 text-teal" />;
}
