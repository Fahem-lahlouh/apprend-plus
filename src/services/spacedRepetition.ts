import type { CardSchedule, Id, ReviewGrade } from '@/models';

/**
 * SpacedRepetitionEngine - a deliberately small SM-2 derivative.
 *
 * The whole engine is pure: it takes the current schedule plus a grade and
 * returns the next schedule. Persistence is the repository's job, which makes
 * the algorithm trivial to unit-test and to swap later.
 */

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;

export function initialSchedule(cardId: Id, now = new Date()): CardSchedule {
  return {
    cardId,
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    dueAt: now.toISOString(),
  };
}

/** Minutes-based interval for cards that are still being learned. */
const LEARNING_STEPS_MINUTES: Record<Exclude<ReviewGrade, 'again'>, number> = {
  hard: 10,
  good: 30,
  easy: 60 * 24,
};

export function review(schedule: CardSchedule, grade: ReviewGrade, now = new Date()): CardSchedule {
  const next: CardSchedule = { ...schedule, lastReviewedAt: now.toISOString() };

  if (grade === 'again') {
    next.repetitions = 0;
    next.lapses = schedule.lapses + 1;
    next.ease = Math.max(MIN_EASE, schedule.ease - 0.2);
    next.intervalDays = 0;
    next.dueAt = addMinutes(now, 5).toISOString();
    return next;
  }

  next.repetitions = schedule.repetitions + 1;
  next.ease = clampEase(schedule.ease + easeDelta(grade));

  if (schedule.repetitions === 0) {
    next.intervalDays = grade === 'easy' ? 1 : 0;
    next.dueAt = addMinutes(now, LEARNING_STEPS_MINUTES[grade]).toISOString();
    return next;
  }

  // Graduating step: the first real interval is fixed rather than derived from
  // the ease, so a card never jumps straight to several days.
  if (schedule.intervalDays === 0) {
    next.intervalDays = grade === 'easy' ? 4 : 1;
    next.dueAt = addDays(now, next.intervalDays).toISOString();
    return next;
  }

  const base = schedule.intervalDays;
  const factor = grade === 'hard' ? 1.2 : grade === 'easy' ? next.ease * 1.3 : next.ease;
  // Easy rounds up so it always lands strictly further out than good, even on
  // short intervals where rounding would otherwise collapse the two.
  next.intervalDays = Math.max(1, grade === 'easy' ? Math.ceil(base * factor) : Math.round(base * factor));
  next.dueAt = addDays(now, next.intervalDays).toISOString();
  return next;
}

export function isDue(schedule: CardSchedule, now = new Date()): boolean {
  return new Date(schedule.dueAt).getTime() <= now.getTime();
}

/** Cards never reviewed come first, then the most overdue ones. */
export function sortByPriority(schedules: CardSchedule[], now = new Date()): CardSchedule[] {
  return [...schedules].sort((a, b) => {
    const overdueA = now.getTime() - new Date(a.dueAt).getTime();
    const overdueB = now.getTime() - new Date(b.dueAt).getTime();
    if (a.repetitions !== b.repetitions) return a.repetitions - b.repetitions;
    return overdueB - overdueA;
  });
}

/** A card counts as "mastered" once it survives a few reviews with a long gap. */
export function isMastered(schedule: CardSchedule): boolean {
  return schedule.repetitions >= 3 && schedule.intervalDays >= 7;
}

function easeDelta(grade: Exclude<ReviewGrade, 'again'>): number {
  if (grade === 'hard') return -0.15;
  if (grade === 'easy') return 0.15;
  return 0;
}

function clampEase(value: number): number {
  return Math.min(3.2, Math.max(MIN_EASE, Number(value.toFixed(2))));
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
