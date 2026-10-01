import Image from 'next/image';
import type { Title } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/**
 * Poster art. Uses `title.poster` when provided by the API,
 * otherwise renders a tinted placeholder with the title typeset on it.
 */
export function Poster({ title, className, compact, priority }: { title: Title; className?: string; compact?: boolean; priority?: boolean }) {
  return (
    <div className={cn('relative overflow-hidden bg-panel', className)} style={{ backgroundColor: title.tint }}>
      {title.poster ? (
        <Image src={title.poster} alt={title.title} fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" priority={priority} />
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: `radial-gradient(90% 60% at 50% 20%, ${title.tint}, #0B0D12 90%)` }} />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(135deg,#fff 0 1px,transparent 1px 10px)' }} />
          {!compact && (
            <div className="absolute inset-x-0 bottom-0 p-4 text-center">
              <span className="block font-display text-2xl font-extrabold leading-tight text-ink/90 drop-shadow">{title.title}</span>
              {title.originalTitle && <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-ink/50">{title.originalTitle}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
