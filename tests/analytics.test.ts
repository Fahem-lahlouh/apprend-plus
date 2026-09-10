import { describe, expect, it } from 'vitest';
import {
  dailySeries,
  overallSuccessRate,
  secondsByDomain,
  secondsInRange,
  startOfWeekKey,
  topicMastery,
  weakTopics,
} from '@/services/analytics';
import type { DayStat, LearningSession, QuizAttempt } from '@/models';

const attempt = (topic: string, correct: boolean, at = '2026-09-10T10:00:00.000Z'): QuizAttempt => ({
  id: `${topic}-${at}-${correct}-${Math.random()}`,
  questionId: 'q', domainId: 'java', topic, correct, answeredAt: at, source: 'quiz',
});

describe('LearningAnalyticsEngine', () => {
  it('aggregates attempts per topic', () => {
    const mastery = topicMastery([
      attempt('Java Streams', false), attempt('Java Streams', true), attempt('Java POO', true),
    ]);
    const streams = mastery.find((m) => m.topic === 'Java Streams')!;
    expect(streams.attempts).toBe(2);
    expect(streams.correct).toBe(1);
    expect(streams.successRate).toBe(50);
  });

  it('only reports a weakness once there are enough attempts', () => {
    const barelyTried = [attempt('Java Streams', false), attempt('Java Streams', false)];
    expect(weakTopics(barelyTried)).toEqual([]);

    const tried = [...barelyTried, attempt('Java Streams', false)];
    expect(weakTopics(tried).map((t) => t.topic)).toEqual(['Java Streams']);
  });

  it('does not flag a topic above the threshold', () => {
    const strong = [attempt('Java POO', true), attempt('Java POO', true), attempt('Java POO', true), attempt('Java POO', false)];
    expect(weakTopics(strong)).toEqual([]);
  });

  it('returns 0 % success on no attempt at all', () => {
    expect(overallSuccessRate([])).toBe(0);
  });

  it('sums time inside a day range and per domain', () => {
    const sessions: LearningSession[] = [
      { id: '1', startedAt: '', endedAt: '', durationSec: 600, day: '2026-09-09', domainId: 'java', activity: 'lesson' },
      { id: '2', startedAt: '', endedAt: '', durationSec: 300, day: '2026-09-10', domainId: 'java', activity: 'quiz' },
      { id: '3', startedAt: '', endedAt: '', durationSec: 900, day: '2026-09-10', domainId: 'data', activity: 'lesson' },
    ];
    expect(secondsInRange(sessions, '2026-09-10', '2026-09-10')).toBe(1200);
    expect(secondsByDomain(sessions)).toEqual({ java: 900, data: 900 });
  });

  it('starts the week on Monday', () => {
    expect(startOfWeekKey(new Date(2026, 8, 10))).toBe('2026-09-07'); // 10 Sept 2026 is a Thursday
  });

  it('fills missing days with zero in the daily series', () => {
    const stats: DayStat[] = [{ day: '2026-09-10', seconds: 1800, xp: 0, goalSeconds: 3000, goalMet: false }];
    const series = dailySeries(stats, 3, new Date(2026, 8, 10));
    expect(series).toHaveLength(3);
    expect(series[0].seconds).toBe(0);
    expect(series[2]).toEqual({ day: '2026-09-10', seconds: 1800 });
  });
});
