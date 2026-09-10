import Dexie, { type Table } from 'dexie';
import type {
  Bookmark,
  Definition,
  DefinitionProgress,
  MemoTargetStat,
  TimedRun,
  CardSchedule,
  Chapter,
  Course,
  DayStat,
  Favorite,
  Flashcard,
  LearningDomain,
  LearningPath,
  LearningSession,
  Lesson,
  LessonProgress,
  Note,
  Preferences,
  ProfileState,
  QuizAttempt,
  QuizQuestion,
  Reminder,
  ReviewItem,
  UnlockedBadge,
} from '@/models';

/** Every store name, in the order used by backup/restore. */
export const STORE_NAMES = [
  'domains',
  'paths',
  'courses',
  'chapters',
  'lessons',
  'questions',
  'flashcards',
  'schedules',
  'lessonProgress',
  'attempts',
  'sessions',
  'dayStats',
  'reminders',
  'favorites',
  'reviewItems',
  'notes',
  'bookmarks',
  'badges',
  'preferences',
  'profile',
  'definitions',
  'definitionProgress',
  'memoTargetStats',
  'timedRuns',
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

export class ApprendPlusDb extends Dexie {
  domains!: Table<LearningDomain, string>;
  paths!: Table<LearningPath, string>;
  courses!: Table<Course, string>;
  chapters!: Table<Chapter, string>;
  lessons!: Table<Lesson, string>;
  questions!: Table<QuizQuestion, string>;
  flashcards!: Table<Flashcard, string>;
  schedules!: Table<CardSchedule, string>;
  lessonProgress!: Table<LessonProgress, string>;
  attempts!: Table<QuizAttempt, string>;
  sessions!: Table<LearningSession, string>;
  dayStats!: Table<DayStat, string>;
  reminders!: Table<Reminder, string>;
  favorites!: Table<Favorite, string>;
  reviewItems!: Table<ReviewItem, string>;
  notes!: Table<Note, string>;
  bookmarks!: Table<Bookmark, string>;
  badges!: Table<UnlockedBadge, string>;
  preferences!: Table<Preferences, string>;
  profile!: Table<ProfileState, string>;
  definitions!: Table<Definition, string>;
  definitionProgress!: Table<DefinitionProgress, string>;
  memoTargetStats!: Table<MemoTargetStat, string>;
  timedRuns!: Table<TimedRun, string>;

  constructor(name = 'apprend-plus') {
    super(name);
    this.version(1).stores({
      domains: 'id, order, archived',
      paths: 'id, domainId, order',
      courses: 'id, domainId, pathId, order, archived',
      chapters: 'id, courseId, order',
      lessons: 'id, chapterId, courseId, domainId, order',
      questions: 'id, domainId, courseId, lessonId, topic',
      flashcards: 'id, domainId, courseId, lessonId',
      schedules: 'cardId, dueAt',
      lessonProgress: 'lessonId, courseId, domainId, status',
      attempts: 'id, questionId, domainId, courseId, topic, answeredAt',
      sessions: 'id, day, domainId, courseId, activity',
      dayStats: 'day, goalMet',
      reminders: 'id, enabled',
      favorites: 'id, kind, refId',
      reviewItems: 'id, kind, refId, dueAt, resolvedAt',
      notes: 'id, lessonId, courseId',
      bookmarks: 'id',
      badges: 'id',
      preferences: 'id',
      profile: 'id',
    });

    // v2 ajoute la mémorisation. Les tables existantes ne changent pas : les
    // définitions sont un nouveau type de contenu, pas une migration.
    this.version(2).stores({
      definitions: 'id, domainId, courseId, lessonId, updatedAt',
      definitionProgress: 'definitionId, level, lastPlayedAt',
      memoTargetStats: 'id, definitionId, key',
      timedRuns: 'id, mode, day, definitionId, score, finishedAt',
    });
  }
}

export const db = new ApprendPlusDb();

/** Table lookup by store name - used by the backup service. */
export function tableOf(db: ApprendPlusDb, name: StoreName): Table<unknown, unknown> {
  return db.table(name) as unknown as Table<unknown, unknown>;
}
