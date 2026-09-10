import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadges, levelForXp, levelProgress, xpFor, xpThresholdForLevel } from '@/services/gamification';

describe('gamification', () => {
  it('exposes the documented XP values', () => {
    expect(xpFor('lessonCompleted')).toBe(10);
    expect(xpFor('quizCorrect')).toBe(5);
    expect(xpFor('quizPerfectBonus')).toBe(20);
  });

  it('maps XP to levels on the documented thresholds', () => {
    expect(xpThresholdForLevel(1)).toBe(0);
    expect(xpThresholdForLevel(2)).toBe(100);
    expect(xpThresholdForLevel(3)).toBe(300);
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(299)).toBe(2);
    expect(levelForXp(300)).toBe(3);
  });

  it('never returns a level below one, even for corrupted XP', () => {
    expect(levelForXp(-50)).toBe(1);
  });

  it('describes progress inside the current level', () => {
    const progress = levelProgress(150);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(50);
    expect(progress.xpForNextLevel).toBe(200);
    expect(progress.percent).toBe(25);
  });

  it('unlocks badges only when their condition is met', () => {
    const none = evaluateBadges({
      lessonsCompleted: 0, coursesCompleted: 0, currentStreak: 0,
      correctAnswers: 0, masteredCards: 0, level: 1, codeRuns: 0,
    });
    expect(none).toEqual([]);

    const some = evaluateBadges({
      lessonsCompleted: 3, coursesCompleted: 1, currentStreak: 7,
      correctAnswers: 100, masteredCards: 2, level: 5, codeRuns: 1,
    });
    expect(some).toContain('first_lesson');
    expect(some).toContain('streak_7');
    expect(some).toContain('quiz_100');
    expect(some).toContain('level_5');
    expect(some).not.toContain('streak_30');
    expect(some).not.toContain('cards_100');
  });

  it('keeps every badge id unique', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});
