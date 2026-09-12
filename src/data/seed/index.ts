import { db } from '@/repositories/db';
import { settingsRepository } from '@/repositories/settingsRepository';
import { buildDomain, type BuiltDomain } from './builders';
import { javaDomain } from './java';
import { stackDomain } from './stack';
import { dataDomain } from './data';
import { anglaisDomain } from './anglais';
import { grammaireDomain } from './grammaire';
import type { DayStat, LearningSession, LessonProgress, Reminder } from '@/models';
import { toDayKey } from '@/utils/date';
import { newId } from '@/utils/id';

export const SEED_VERSION = 3;

/** Lessons pre-marked as done so the app opens on a realistic state. */
const DEMO_COMPLETED_LESSONS = [
  // Java : le parcours est suivi dans l'ordre, jusqu'au milieu de la POO.
  'java-l-introduction', 'java-l-ou-sert-java',
  'java-l-jvm', 'java-l-jdk-jre',
  'java-l-premier-programme', 'java-l-packages-imports', 'java-l-compiler-executer',
  'java-l-variables', 'java-l-types-primitifs', 'java-l-string', 'java-l-wrappers',
  'java-l-operateurs', 'java-l-comparaison-logique',
  'java-l-conditions', 'java-l-switch',
  'java-l-boucles', 'java-l-break-continue',
  'java-l-methodes', 'java-l-surcharge',
  'java-l-poo', 'java-l-classes', 'java-l-attributs', 'java-l-constructeurs',
  // Data : 2 / 5
  'data-l-select', 'data-l-joins',
  // Anglais : 3 / 10
  'en-l-vocab-dev', 'en-l-vocab-meeting', 'en-l-présent-simple',
  // Grammaire : 6 / 11
  'fr-l-sujet-verbe', 'fr-l-participe-avoir', 'fr-l-participe-être',
  'fr-l-adjectifs', 'fr-l-présent', 'fr-l-passé-composé',
];

function buildAll(now: string): BuiltDomain[] {
  return [javaDomain, stackDomain, dataDomain, anglaisDomain, grammaireDomain].map((spec, index) =>
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
      courseId: 'java-c1-debutant',
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
    courseId: 'java-c2-objet',
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

/**
 * Contenu Java de la v1, remplacé par le parcours en cinq étapes.
 *
 * `bulkPut` ajoute et met à jour, mais ne supprime rien : sans ce nettoyage, une
 * installation existante afficherait les anciens cours à côté des nouveaux. La
 * liste est explicite plutôt que déduite, pour qu'aucun contenu créé par
 * l'utilisateur ne puisse être emporté au passage.
 */
const RETIRED_V1_CONTENT = {
  paths: ['java-path-fondamentaux'],
  courses: ['java-fondamentaux', 'java-poo', 'java-moderne'],
  chapters: [
    'java-ch-démarrer', 'java-ch-variables', 'java-ch-classes', 'java-ch-héritage',
    'java-ch-collections', 'java-ch-exceptions', 'java-ch-streams', 'java-ch-flux',
    'java-ch-versions',
  ],
  lessons: ['java-l-conversions', 'java-l-types', 'java-l-héritage', 'java-l-méthodes'],
  questions: [
    'java-q-intro-1', 'java-q-var-1', 'java-q-conv-1', 'java-q-cond-1',
    'java-q-classes-1', 'java-q-encap-1', 'java-q-héritage-1', 'java-q-poly-1',
    'java-q-exceptions-1', 'java-q-exceptions-2', 'java-q-streams-1', 'java-q-streams-2',
  ],
  flashcards: [
    'java-fc-jvm', 'java-fc-jdk', 'java-fc-encaps', 'java-fc-poly', 'java-fc-equals',
    'java-fc-hashmap', 'java-fc-checked', 'java-fc-stream-lazy', 'java-fc-optional',
    'java-fc-record',
  ],
};

async function pruneRetiredContent(): Promise<void> {
  await db.paths.bulkDelete(RETIRED_V1_CONTENT.paths);
  await db.courses.bulkDelete(RETIRED_V1_CONTENT.courses);
  await db.chapters.bulkDelete(RETIRED_V1_CONTENT.chapters);
  await db.lessons.bulkDelete(RETIRED_V1_CONTENT.lessons);
  await db.questions.bulkDelete(RETIRED_V1_CONTENT.questions);
  await db.flashcards.bulkDelete(RETIRED_V1_CONTENT.flashcards);

  // La progression et les révisions qui pointaient vers ces leçons n'ont plus
  // de cible : les laisser fausserait les pourcentages d'avancement.
  await db.lessonProgress.bulkDelete(RETIRED_V1_CONTENT.lessons);
  await db.schedules.bulkDelete(RETIRED_V1_CONTENT.flashcards);
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
    await pruneRetiredContent();
    await db.domains.bulkPut(built.map((b) => b.domain));
    await db.paths.bulkPut(built.flatMap((b) => b.paths));
    await db.courses.bulkPut(built.flatMap((b) => b.courses));
    await db.chapters.bulkPut(built.flatMap((b) => b.chapters));
    await db.lessons.bulkPut(built.flatMap((b) => b.lessons));
    await db.questions.bulkPut(built.flatMap((b) => b.questions));
    await db.flashcards.bulkPut(built.flatMap((b) => b.flashcards));
    await db.reminders.bulkPut(demoReminders(now));

    // Les définitions du parcours entrent dans la même table que celles saisies
    // à la main : elles sont donc jouables par tous les jeux de mémorisation,
    // présents comme à venir, sans traitement particulier.
    await db.definitions.bulkPut(built.flatMap((b) => b.definitions));

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
        courseId: 'java-c2-objet',
        lessonId: 'java-l-encapsulation',
        lessonTitle: 'Encapsuler les données',
        courseTitle: 'Java — Programmation objet',
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
