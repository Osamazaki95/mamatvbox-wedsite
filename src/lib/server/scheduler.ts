import { read } from './store';
import { isSyncRunning, runSync, tmdbConfigured } from './tmdb';

const g = globalThis as unknown as { __mtbScheduler?: ReturnType<typeof setInterval> };

/** Checks every 10 minutes whether a sync is due (interval set from the dashboard). */
export function startScheduler() {
  if (g.__mtbScheduler) return;
  const tick = async () => {
    try {
      const s = (await read('settings')).sync;
      if (!s.enabled || !tmdbConfigured() || isSyncRunning()) return;
      const last = s.lastRunAt ? Date.parse(s.lastRunAt) : 0;
      if (Date.now() - last >= s.intervalHours * 3_600_000) await runSync();
    } catch (e) {
      console.error('[mamatvbox] scheduler', e);
    }
  };
  g.__mtbScheduler = setInterval(tick, 10 * 60_000);
  setTimeout(tick, 30_000);
}
