import type { DayKey, DayStat, LearningSession, QuizAttempt } from '@/models';
import { toDayKey } from '@/utils/date';

/**
 * LearningAnalyticsEngine - every number shown in the app comes from here.
 * All functions are pure so the statistics screens can never drift from data.
 */

export interface TopicMastery {
  topic: string;
  domainId: string;
  attempts: number;
  correct: number;
  successRate: number;
  lastAttemptAt: string;
}

const MIN_ATTEMPTS_FOR_MASTERY = 3;
export const WEAKNESS_THRESHOLD = 70;

export function topicMastery(attempts: QuizAttempt[]): TopicMastery[] {
  const byTopic = new Map<string, TopicMastery>();
  for (const attempt of attempts) {
    const entry = byTopic.get(attempt.topic) ?? {
      topic: attempt.topic,
      domainId: attempt.domainId,
      attempts: 0,
      correct: 0,
      successRate: 0,
      lastAttemptAt: attempt.answeredAt,
    };
    entry.attempts += 1;
    if (attempt.correct) entry.correct += 1;
    if (attempt.answeredAt > entry.lastAttemptAt) entry.lastAttemptAt = attempt.answeredAt;
    byTopic.set(attempt.topic, entry);
  }
  return [...byTopic.values()]
    .map((entry) => ({ ...entry, successRate: Math.round((entry.correct / entry.attempts) * 100) }))
    .sort((a, b) => a.successRate - b.successRate);
}

/** Topics answered often enough and below the threshold: the "À renforcer" list. */
export function weakTopics(attempts: QuizAttempt[], limit = 5): TopicMastery[] {
  return topicMastery(attempts)
    .filter((t) => t.attempts >= MIN_ATTEMPTS_FOR_MASTERY && t.successRate < WEAKNESS_THRESHOLD)
    .slice(0, limit);
}

export function overallSuccessRate(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter((a) => a.correct).length;
  return Math.round((correct / attempts.length) * 100);
}

/* ------------------------------ Time spent ------------------------------ */

export function secondsInRange(sessions: LearningSession[], fromDay: DayKey, toDay: DayKey): number {
  return sessions
    .filter((s) => s.day >= fromDay && s.day <= toDay)
    .reduce((total, s) => total + s.durationSec, 0);
}

export function secondsByDomain(sessions: LearningSession[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const session of sessions) {
    if (!session.domainId) continue;
    out[session.domainId] = (out[session.domainId] ?? 0) + session.durationSec;
  }
  return out;
}

export function startOfWeekKey(today = new Date()): DayKey {
  const date = new Date(today);
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - weekday);
  return toDayKey(date);
}

export function startOfMonthKey(today = new Date()): DayKey {
  return toDayKey(new Date(today.getFullYear(), today.getMonth(), 1));
}

/** Seconds studied for the last `days` calendar days, oldest first. */
export function dailySeries(stats: DayStat[], days: number, today = new Date()): { day: DayKey; seconds: number }[] {
  const byDay = new Map(stats.map((s) => [s.day, s.seconds]));
  const out: { day: DayKey; seconds: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = toDayKey(date);
    out.push({ day: key, seconds: byDay.get(key) ?? 0 });
  }
  return out;
}
