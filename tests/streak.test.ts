import { describe, expect, it } from 'vitest';
import { applySecondsToDay, computeStreak } from '@/services/streak';
import type { DayStat } from '@/models';

const stat = (day: string, goalMet: boolean): DayStat => ({
  day,
  seconds: goalMet ? 3000 : 300,
  xp: 0,
  goalSeconds: 3000,
  goalMet,
});

describe('streak', () => {
  it('counts consecutive days ending today', () => {
    const stats = [stat('2026-09-08', true), stat('2026-09-09', true), stat('2026-09-10', true)];
    expect(computeStreak(stats, '2026-09-10').current).toBe(3);
  });

  it('keeps yesterday-based streaks alive while today is unfinished', () => {
    const stats = [stat('2026-09-08', true), stat('2026-09-09', true)];
    const result = computeStreak(stats, '2026-09-10');
    expect(result.current).toBe(2);
    expect(result.atRisk).toBe(true);
  });

  it('breaks after a full missed day', () => {
    const stats = [stat('2026-09-06', true), stat('2026-09-07', true)];
    expect(computeStreak(stats, '2026-09-10').current).toBe(0);
  });

  it('reports the best run even when the current one is shorter', () => {
    const stats = [
      stat('2026-08-01', true), stat('2026-08-02', true), stat('2026-08-03', true), stat('2026-08-04', true),
      stat('2026-09-10', true),
    ];
    const result = computeStreak(stats, '2026-09-10');
    expect(result.current).toBe(1);
    expect(result.best).toBe(4);
  });

  it('returns zero without any data', () => {
    expect(computeStreak([], '2026-09-10')).toEqual({ current: 0, best: 0, atRisk: false });
  });

  it('accumulates seconds into a day and flips the goal once reached', () => {
    const first = applySecondsToDay(undefined, '2026-09-10', 1200, 3000);
    expect(first.goalMet).toBe(false);
    const second = applySecondsToDay(first, '2026-09-10', 1900, 3000, 10);
    expect(second.seconds).toBe(3100);
    expect(second.xp).toBe(10);
    expect(second.goalMet).toBe(true);
  });
});
