import { db } from '@/repositories/db';
import { settingsRepository } from '@/repositories/settingsRepository';
import { buildDomain, type BuiltDomain } from './builders';
import { javaDomain } from './java';
import { dataDomain } from './data';
import { anglaisDomain } from './anglais';
import { grammaireDomain } from './grammaire';
import type { DayStat, LearningSession, LessonProgress, Reminder } from '@/models';
import { toDayKey } from '@/utils/date';
import { newId } from '@/utils/id';

export const SEED_VERSION = 1;

/** Lessons pre-marked as done so the app opens on a realistic state. */
const DEMO_COMPLETED_LESSONS = [
  // Java : 14 / 21 leçons
  'java-l-introduction', 'java-l-jvm', 'java-l-premier-programme',
  'java-l-variables', 'java-l-types', 'java-l-conversions',
  'java-l-conditions', 'java-l-boucles', 'java-l-méthodes',
  'java-l-classes', 'java-l-encapsulation',
  'java-l-héritage', 'java-l-polymorphisme', 'java-l-interfaces',
  // Data : 2 / 5
  'data-l-select', 'data-l-joins',
  // Anglais : 3 / 10
  'en-l-vocab-dev', 'en-l-vocab-meeting', 'en-l-présent-simple',
  // Grammaire : 6 / 11
  'fr-l-sujet-verbe', 'fr-l-participe-avoir', 'fr-l-participe-être',
  'fr-l-adjectifs', 'fr-l-présent', 'fr-l-passé-composé',
];

function buildAll(now: string): BuiltDomain[] {
  return [javaDomain, dataDomain, anglaisDomain, grammaireDomain].map((spec, index) =>
    buildDomain(spec, index, now),
  );
}

function demoReminders(now: string): Reminder[] {
  return [
    {
      id: 'rem-java',
      title: 'Cours Java',
      subtitle: '20 min · Programmation',
      days: [1, 2, 3, 4, 5],
      time: '18:00',
      durationMin: 20,
      enabled: true,
      domainId: 'java',
      courseId: 'java-fondamentaux',
      createdAt: now,
    },
    {
      id: 'rem-data',
      title: 'Exercices Data',
      subtitle: '15 min · Analyse de données',
      days: [1, 3, 5],
      time: '08:00',
      durationMin: 15,
      enabled: true,
      domainId: 'data',
      createdAt: now,
    },
    {
      id: 'rem-anglais',
      title: 'Anglais - grammaire',
      subtitle: '10 min · Révision',
      days: [0, 1, 2, 3, 4, 5, 6],
      time: '19:00',
      durationMin: 10,
      enabled: true,
      domainId: 'anglais',
      createdAt: now,
    },
  ];
}

/**
 * Demo history: an 8-day streak plus 35 minutes today, so the home screen shows
 * real numbers computed from real sessions rather than hard-coded values.
 */
function demoHistory(goalMinutes: number): { sessions: LearningSession[]; stats: DayStat[] } {
  const sessions: LearningSession[] = [];
  const stats: DayStat[] = [];
  const goalSeconds = goalMinutes * 60;
  const domains = ['java', 'anglais', 'data', 'grammaire'];

  for (let offset = 8; offset >= 1; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    date.setHours(18, 30, 0, 0);
    const seconds = goalSeconds + (offset % 3) * 300;
    const day = toDayKey(date);
    sessions.push({
      id: newId('sess'),
      startedAt: new Date(date.getTime() - seconds * 1000).toISOString(),
      endedAt: date.toISOString(),
      durationSec: seconds,
      day,
      domainId: domains[offset % domains.length],
      activity: offset % 2 === 0 ? 'lesson' : 'flashcards',
    });
    stats.push({ day, seconds, xp: 40, goalSeconds, goalMet: true });
  }

  const today = new Date();
  const todaySeconds = 35 * 60;
  const todayKey = toDayKey(today);
  sessions.push({
    id: newId('sess'),
    startedAt: new Date(today.getTime() - todaySeconds * 1000).toISOString(),
    endedAt: today.toISOString(),
    durationSec: todaySeconds,
    day: todayKey,
    domainId: 'java',
    courseId: 'java-poo',
    activity: 'lesson',
  });
  stats.push({
    day: todayKey,
    seconds: todaySeconds,
    xp: 30,
    goalSeconds,
    goalMet: todaySeconds >= goalSeconds,
  });

  return { sessions, stats };
}

export interface SeedOptions {
  withDemoProgress?: boolean;
}

/** Idempotent: seeding twice never duplicates rows because ids are stable. */
export async function seedDatabase(options: SeedOptions = {}): Promise<void> {
  const now = new Date().toISOString();
  const built = buildAll(now);
  const prefs = await settingsRepository.getPreferences();

  await db.transaction('rw', db.tables, async () => {
    await db.domains.bulkPut(built.map((b) => b.domain));
    await db.paths.bulkPut(built.flatMap((b) => b.paths));
    await db.courses.bulkPut(built.flatMap((b) => b.courses));
    await db.chapters.bulkPut(built.flatMap((b) => b.chapters));
    await db.lessons.bulkPut(built.flatMap((b) => b.lessons));
    await db.questions.bulkPut(built.flatMap((b) => b.questions));
    await db.flashcards.bulkPut(built.flatMap((b) => b.flashcards));
    await db.reminders.bulkPut(demoReminders(now));

    if (options.withDemoProgress) {
      const lessons = built.flatMap((b) => b.lessons);
      const byId = new Map(lessons.map((l) => [l.id, l]));
      const progress: LessonProgress[] = [];
      for (const lessonId of DEMO_COMPLETED_LESSONS) {
        const lesson = byId.get(lessonId);
        if (!lesson) continue;
        progress.push({
          lessonId: lesson.id,
          courseId: lesson.courseId,
          domainId: lesson.domainId,
          status: 'completed',
          startedAt: now,
          completedAt: now,
        });
      }
      await db.lessonProgress.bulkPut(progress);

      const history = demoHistory(prefs.dailyGoalMinutes);
      await db.sessions.bulkPut(history.sessions);
      await db.dayStats.bulkPut(history.stats);
      await db.profile.put({ id: 'profile', xp: progress.length * 10 + 320, createdAt: now });
      await db.bookmarks.put({
        id: 'last',
        domainId: 'java',
        courseId: 'java-poo',
        lessonId: 'java-l-exceptions',
        lessonTitle: 'Gérer les exceptions',
        courseTitle: 'Java - Programmation objet',
        at: now,
      });
    }
  });

  await settingsRepository.savePreferences({ seedVersion: SEED_VERSION });
}

/** Runs once on a fresh install. */
export async function ensureSeeded(): Promise<boolean> {
  const prefs = await settingsRepository.getPreferences();
  if (prefs.seedVersion >= SEED_VERSION) return false;
  const alreadyHasContent = (await db.domains.count()) > 0;
  await seedDatabase({ withDemoProgress: !alreadyHasContent });
  return true;
}
