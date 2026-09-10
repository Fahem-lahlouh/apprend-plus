import type { DayKey, DayStat } from '@/models';
import { dayKeyOffset, toDayKey } from '@/utils/date';

export interface StreakResult {
  current: number;
  best: number;
  /** True while today's goal is not met but yesterday's was: the streak is at risk. */
  atRisk: boolean;
}

/**
 * Streaks are derived from the day stats, never stored as a counter that could
 * drift. Today counts only once the goal is met, but a not-yet-finished today
 * does not break a streak that ran until yesterday.
 */
export function computeStreak(stats: DayStat[], today: DayKey = toDayKey()): StreakResult {
  const met = new Set(stats.filter((s) => s.goalMet).map((s) => s.day));

  const startFrom = met.has(today) ? today : dayKeyOffset(today, -1);
  let current = 0;
  let cursor = startFrom;
  while (met.has(cursor)) {
    current += 1;
    cursor = dayKeyOffset(cursor, -1);
  }

  const best = bestRun(met);
  const atRisk = current > 0 && !met.has(today);
  return { current, best: Math.max(best, current), atRisk };
}

function bestRun(met: Set<DayKey>): number {
  const days = [...met].sort();
  let best = 0;
  let run = 0;
  let previous: DayKey | null = null;
  for (const day of days) {
    run = previous !== null && dayKeyOffset(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}

/** Merges a new amount of seconds into a day stat and re-evaluates the goal. */
export function applySecondsToDay(
  existing: DayStat | undefined,
  day: DayKey,
  seconds: number,
  goalSeconds: number,
  xp = 0,
): DayStat {
  const total = (existing?.seconds ?? 0) + Math.max(0, seconds);
  return {
    day,
    seconds: total,
    xp: (existing?.xp ?? 0) + Math.max(0, xp),
    goalSeconds,
    goalMet: total >= goalSeconds && goalSeconds > 0,
  };
}
