import { describe, expect, it } from 'vitest';
import { recommendActivities } from '@/services/recommendation';
import { initialSchedule } from '@/services/spacedRepetition';
import type { Bookmark, LearningDomain, QuizAttempt, ReviewItem } from '@/models';

const now = new Date('2026-09-10T10:00:00.000Z');

const domain: LearningDomain = {
  id: 'java', name: 'Java', description: 'Coder', icon: 'code', accent: 'violet',
  order: 0, archived: false, builtIn: true, createdAt: '',
};

const attempt = (correct: boolean): QuizAttempt => ({
  id: Math.random().toString(), questionId: 'q', domainId: 'java',
  topic: 'Java Streams', correct, answeredAt: now.toISOString(), source: 'quiz',
});

describe('recommendation engine', () => {
  it('suggests starting a domain when there is no history at all', () => {
    const result = recommendActivities({ schedules: [], attempts: [], reviewItems: [], domains: [domain], now });
    expect(result).toHaveLength(1);
    expect(result[0].to).toBe('/courses/domain/java');
  });

  it('puts resuming the bookmarked lesson first', () => {
    const bookmark: Bookmark = {
      id: 'last', domainId: 'java', courseId: 'c', lessonId: 'l',
      lessonTitle: 'Streams', courseTitle: 'Java moderne', at: now.toISOString(),
    };
    const result = recommendActivities({
      bookmark, schedules: [initialSchedule('card', now)], attempts: [], reviewItems: [], domains: [domain], now,
    });
    expect(result[0].id).toBe('continue');
    expect(result.some((r) => r.id === 'due-cards')).toBe(true);
  });

  it('surfaces a weak topic with a quiz link', () => {
    const attempts = [attempt(false), attempt(false), attempt(true)];
    const result = recommendActivities({ schedules: [], attempts, reviewItems: [], domains: [domain], now });
    const weak = result.find((r) => r.id.startsWith('weak-'));
    expect(weak?.to).toContain('/games/quiz?topic=');
    expect(weak?.title).toContain('Java Streams');
  });

  it('ignores review items that are already resolved', () => {
    const items: ReviewItem[] = [
      { id: 'a', kind: 'lesson', refId: 'l', label: 'Streams', createdAt: '', dueAt: '', resolvedAt: now.toISOString() },
    ];
    const result = recommendActivities({ schedules: [], attempts: [], reviewItems: items, domains: [domain], now });
    expect(result.some((r) => r.id === 'review-list')).toBe(false);
  });

  it('does not propose cards that are not due yet', () => {
    const future = { ...initialSchedule('card', now), dueAt: new Date(now.getTime() + 86_400_000).toISOString() };
    const result = recommendActivities({ schedules: [future], attempts: [], reviewItems: [], domains: [domain], now });
    expect(result.some((r) => r.id === 'due-cards')).toBe(false);
  });
});
