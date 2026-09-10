import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/repositories/db';
import { seedDatabase } from '@/data/seed';
import { settingsRepository } from '@/repositories/settingsRepository';
import { progressRepository } from '@/repositories/progressRepository';
import {
  addToReview,
  buildReviewQueue,
  completeLesson,
  recordAttempt,
  recordSession,
  resolveReviewItem,
  reviewFlashcard,
  toggleFavorite,
} from '@/services/learningService';
import { computeStreak } from '@/services/streak';
import { domainProgress } from '@/services/progression';
import { toDayKey } from '@/utils/date';

async function reset() {
  // Sequential inside one transaction: clearing tables concurrently races with
  // Dexie's auto-open and occasionally leaves a table populated.
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
}

describe('learning flow against IndexedDB', () => {
  beforeEach(async () => {
    await reset();
    await seedDatabase();
  });

  it('seeds the four built-in domains with real content', async () => {
    expect(await db.domains.count()).toBe(4);
    expect(await db.lessons.count()).toBeGreaterThan(30);
    expect(await db.questions.count()).toBeGreaterThan(20);
    expect(await db.flashcards.count()).toBeGreaterThan(20);
  });

  it('is idempotent: seeding twice does not duplicate rows', async () => {
    const before = await db.lessons.count();
    await seedDatabase();
    expect(await db.lessons.count()).toBe(before);
  });

  it('starts with zero progress when demo progress is not requested', async () => {
    const lessons = await db.lessons.toArray();
    const progress = await db.lessonProgress.toArray();
    expect(domainProgress(lessons, progress, 'java').percent).toBe(0);
  });

  it('creates the demo history with an 8 day streak and 35 minutes today', async () => {
    await reset();
    await seedDatabase({ withDemoProgress: true });
    const stats = await db.dayStats.toArray();
    expect(computeStreak(stats).current).toBeGreaterThanOrEqual(8);
    const today = stats.find((s) => s.day === toDayKey());
    expect(today?.seconds).toBe(35 * 60);
  });

  it('awards XP and updates progression when a lesson is completed', async () => {
    const lesson = (await db.lessons.get('java-l-jvm'))!;
    const award = await completeLesson(lesson);
    expect(award?.amount).toBe(10);
    expect((await settingsRepository.getProfile()).xp).toBe(10);

    const progress = await db.lessonProgress.get(lesson.id);
    expect(progress?.status).toBe('completed');

    const lessons = await db.lessons.toArray();
    expect(domainProgress(lessons, await db.lessonProgress.toArray(), 'java').completed).toBe(1);
  });

  it('never awards the same lesson twice', async () => {
    const lesson = (await db.lessons.get('java-l-jvm'))!;
    await completeLesson(lesson);
    expect(await completeLesson(lesson)).toBeNull();
    expect((await settingsRepository.getProfile()).xp).toBe(10);
  });

  it('unlocks the first-lesson badge', async () => {
    const lesson = (await db.lessons.get('java-l-jvm'))!;
    const award = await completeLesson(lesson);
    expect(award?.newBadges).toContain('first_lesson');
  });

  it('records a session, feeds the day stat and grants the daily-goal bonus once', async () => {
    await settingsRepository.savePreferences({ dailyGoalMinutes: 10 });
    await recordSession({ durationSec: 400, activity: 'lesson', domainId: 'java' });
    let stat = await progressRepository.getDayStat(toDayKey());
    expect(stat?.goalMet).toBe(false);

    await recordSession({ durationSec: 400, activity: 'quiz', domainId: 'java' });
    stat = await progressRepository.getDayStat(toDayKey());
    expect(stat?.goalMet).toBe(true);
    expect((await settingsRepository.getProfile()).xp).toBe(25);

    await recordSession({ durationSec: 400, activity: 'quiz', domainId: 'java' });
    expect((await settingsRepository.getProfile()).xp).toBe(25);
  });

  it('ignores sessions shorter than five seconds', async () => {
    await recordSession({ durationSec: 2, activity: 'lesson' });
    expect(await db.sessions.count()).toBe(0);
  });

  it('stores quiz attempts and only rewards correct ones', async () => {
    const question = (await db.questions.get('java-q-jvm-1'))!;
    expect(await recordAttempt(question, false, 'quiz')).toBeNull();
    const award = await recordAttempt(question, true, 'quiz');
    expect(award?.amount).toBe(5);
    expect(await db.attempts.count()).toBe(2);
  });

  it('reschedules a reviewed flashcard out of the due queue', async () => {
    const before = await buildReviewQueue({ courseId: 'java-c1-debutant' });
    expect(before.length).toBeGreaterThan(0);

    const card = before[0].card;
    await reviewFlashcard(card, 'easy');
    const after = await buildReviewQueue({ courseId: 'java-c1-debutant' });
    expect(after.some((entry) => entry.card.id === card.id)).toBe(false);
  });

  it('brings a failed card back almost immediately', async () => {
    const [{ card }] = await buildReviewQueue({ courseId: 'java-c1-debutant' });
    await reviewFlashcard(card, 'again');
    const schedule = (await db.schedules.get(card.id))!;
    expect(new Date(schedule.dueAt).getTime() - Date.now()).toBeLessThan(10 * 60_000);
  });

  it('toggles favorites on and off', async () => {
    expect(await toggleFavorite('course', 'java-c2-objet', 'Java POO')).toBe(true);
    expect(await db.favorites.count()).toBe(1);
    expect(await toggleFavorite('course', 'java-c2-objet', 'Java POO')).toBe(false);
    expect(await db.favorites.count()).toBe(0);
  });

  it('adds and resolves review items without duplicating them', async () => {
    await addToReview('lesson', 'java-l-streams', 'Streams');
    await addToReview('lesson', 'java-l-streams', 'Streams');
    expect(await db.reviewItems.count()).toBe(1);
    await resolveReviewItem('lesson:java-l-streams');
    expect(await db.reviewItems.count()).toBe(0);
  });
});
