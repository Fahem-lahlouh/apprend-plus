import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EASE,
  MIN_EASE,
  initialSchedule,
  isDue,
  isMastered,
  review,
  sortByPriority,
} from '@/services/spacedRepetition';

const now = new Date('2026-09-10T10:00:00.000Z');

describe('SpacedRepetitionEngine', () => {
  it('creates a schedule that is immediately due', () => {
    const schedule = initialSchedule('card-1', now);
    expect(schedule.ease).toBe(DEFAULT_EASE);
    expect(schedule.repetitions).toBe(0);
    expect(isDue(schedule, now)).toBe(true);
  });

  it('pushes a failed card back within minutes and lowers the ease', () => {
    const first = review(initialSchedule('c', now), 'good', now);
    const failed = review(first, 'again', now);
    expect(failed.repetitions).toBe(0);
    expect(failed.lapses).toBe(1);
    expect(failed.ease).toBeLessThan(first.ease);
    const minutes = (new Date(failed.dueAt).getTime() - now.getTime()) / 60000;
    expect(minutes).toBeCloseTo(5, 5);
  });

  it('never lets the ease fall below the floor', () => {
    let schedule = initialSchedule('c', now);
    for (let i = 0; i < 20; i += 1) schedule = review(schedule, 'again', now);
    expect(schedule.ease).toBe(MIN_EASE);
  });

  it('grows the interval on successive good reviews', () => {
    let schedule = initialSchedule('c', now);
    schedule = review(schedule, 'good', now); // learning step, still same day
    expect(schedule.intervalDays).toBe(0);
    schedule = review(schedule, 'good', now);
    expect(schedule.intervalDays).toBe(1);
    const third = review(schedule, 'good', now);
    expect(third.intervalDays).toBeGreaterThan(schedule.intervalDays);
  });

  it('gives easy a longer interval than good', () => {
    const base = review(review(initialSchedule('c', now), 'good', now), 'good', now);
    expect(review(base, 'easy', now).intervalDays).toBeGreaterThan(review(base, 'good', now).intervalDays);
  });

  it('marks a card mastered only after several long-interval reviews', () => {
    const almost = { ...initialSchedule('c', now), repetitions: 3, intervalDays: 4 };
    expect(isMastered(almost)).toBe(false);
    expect(isMastered({ ...almost, intervalDays: 10 })).toBe(true);
  });

  it('shows never-seen cards before overdue ones', () => {
    const fresh = initialSchedule('fresh', now);
    const seen = { ...initialSchedule('seen', now), repetitions: 4 };
    expect(sortByPriority([seen, fresh], now)[0].cardId).toBe('fresh');
  });
});
