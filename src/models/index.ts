/**
 * Domain models for Apprend+.
 *
 * These types describe the shape of everything stored in IndexedDB. They are
 * intentionally free of any UI or Dexie concern: repositories translate them to
 * and from storage, services own the business rules, components only render.
 */

export type Id = string;
export type IsoDate = string; // full ISO timestamp
export type DayKey = string; // "YYYY-MM-DD"

export type Level = 'debutant' | 'intermediaire' | 'avance';
export type CourseStatus = 'not_started' | 'in_progress' | 'completed';

/* ------------------------------------------------------------------ */
/* Learning tree: Domain > Path > Course > Chapter > Lesson > Exercise */
/* ------------------------------------------------------------------ */

export interface LearningDomain {
  id: Id;
  name: string;
  description: string;
  icon: string;
  /** Accent key from the design system palette (violet, green, pink, amber...). */
  accent: AccentKey;
  order: number;
  archived: boolean;
  builtIn: boolean;
  createdAt: IsoDate;
}

export interface LearningPath {
  id: Id;
  domainId: Id;
  title: string;
  description: string;
  order: number;
}

export interface Course {
  id: Id;
  domainId: Id;
  pathId?: Id;
  title: string;
  description: string;
  icon: string;
  level: Level;
  estimatedMinutes: number;
  tags: string[];
  order: number;
  archived: boolean;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface Chapter {
  id: Id;
  courseId: Id;
  title: string;
  description?: string;
  order: number;
}

export interface Lesson {
  id: Id;
  chapterId: Id;
  courseId: Id;
  domainId: Id;
  title: string;
  summary: string;
  estimatedMinutes: number;
  order: number;
  blocks: ContentBlock[];
}

/* ---------------------------- Content blocks ---------------------------- */

export type ContentBlock =
  | TextBlock
  | DefinitionBlock
  | ExampleBlock
  | CodeBlock
  | TipBlock
  | WarningBlock
  | KeyPointsBlock
  | QuizBlock
  | ExerciseBlock
  | PronunciationBlock;

export interface TextBlock {
  kind: 'text';
  title?: string;
  text: string;
}
export interface DefinitionBlock {
  kind: 'definition';
  term: string;
  text: string;
}
export interface ExampleBlock {
  kind: 'example';
  title?: string;
  text: string;
}
export interface CodeBlock {
  kind: 'code';
  language: CodeLanguage;
  code: string;
  caption?: string;
  /** When true the lesson offers a "practice this snippet" shortcut. */
  runnable?: boolean;
}
export interface TipBlock {
  kind: 'tip';
  text: string;
}
export interface WarningBlock {
  kind: 'warning';
  text: string;
}
export interface KeyPointsBlock {
  kind: 'keypoints';
  title?: string;
  points: string[];
}
export interface QuizBlock {
  kind: 'quiz';
  questionId: Id;
}
export interface ExerciseBlock {
  kind: 'exercise';
  title: string;
  statement: string;
  language: CodeLanguage;
  starterCode: string;
  solution?: string;
  hint?: string;
}
export interface PronunciationBlock {
  kind: 'pronunciation';
  word: string;
  phonetic?: string;
  sentence?: string;
  translation?: string;
  lang: string; // BCP-47, e.g. "en-US"
}

export type CodeLanguage = 'java' | 'javascript' | 'python' | 'sql' | 'text';

/* -------------------------------- Quiz --------------------------------- */

export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'free_text'
  | 'fill_blank'
  | 'match'
  | 'code_output'
  | 'find_bug';

export interface QuizQuestion {
  id: Id;
  domainId: Id;
  courseId?: Id;
  lessonId?: Id;
  /** Fine-grained skill label used by the analytics engine ("Java Streams"). */
  topic: string;
  type: QuestionType;
  prompt: string;
  /** Optional code shown above the answers (code_output / find_bug). */
  code?: string;
  language?: CodeLanguage;
  options?: string[];
  /** Index for mcq / code_output / find_bug, "true"/"false", or accepted text. */
  answer: string;
  /** Accepted alternatives for free_text / fill_blank (lower-cased compare). */
  acceptedAnswers?: string[];
  /** Pairs for the `match` type. */
  pairs?: { left: string; right: string }[];
  explanation: string;
  tags: string[];
}

export interface QuizAttempt {
  id: Id;
  questionId: Id;
  domainId: Id;
  courseId?: Id;
  topic: string;
  correct: boolean;
  answeredAt: IsoDate;
  /** Where the attempt came from, so games and lessons can be told apart. */
  source: 'lesson' | 'quiz' | 'game' | 'review';
}

/* ----------------------------- Flashcards ------------------------------ */

export interface Flashcard {
  id: Id;
  domainId: Id;
  courseId?: Id;
  lessonId?: Id;
  front: string;
  back: string;
  example?: string;
  /** BCP-47 language of the front side, enables speech synthesis. */
  lang?: string;
  tags: string[];
  createdAt: IsoDate;
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

/** Spaced-répétition state, one row per flashcard. */
export interface CardSchedule {
  cardId: Id;
  ease: number; // SM-2 style ease factor
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: IsoDate;
  lastReviewedAt?: IsoDate;
}

/* ----------------------------- Progression ----------------------------- */

export interface LessonProgress {
  lessonId: Id;
  courseId: Id;
  domainId: Id;
  status: 'in_progress' | 'completed';
  startedAt: IsoDate;
  completedAt?: IsoDate;
}

export interface LearningSession {
  id: Id;
  startedAt: IsoDate;
  endedAt: IsoDate;
  durationSec: number;
  day: DayKey;
  domainId?: Id;
  courseId?: Id;
  lessonId?: Id;
  activity: ActivityKind;
}

export type ActivityKind = 'lesson' | 'quiz' | 'flashcards' | 'game' | 'practice';

/** One aggregated row per calendar day - the basis for streaks and calendar. */
export interface DayStat {
  day: DayKey;
  seconds: number;
  xp: number;
  goalSeconds: number;
  goalMet: boolean;
}

/* ------------------------------ Reminders ------------------------------ */

export interface Reminder {
  id: Id;
  title: string;
  subtitle?: string;
  /** 0 = Sunday ... 6 = Saturday. Empty array = one-off on `date`. */
  days: number[];
  time: string; // "HH:mm"
  durationMin: number;
  enabled: boolean;
  domainId?: Id;
  courseId?: Id;
  createdAt: IsoDate;
  lastFiredAt?: IsoDate;
}

/* ------------------------- Personal annotations ------------------------ */

export type EntityKind = 'domain' | 'course' | 'lesson' | 'flashcard' | 'question';

export interface Favorite {
  id: Id; // `${kind}:${refId}`
  kind: EntityKind;
  refId: Id;
  label: string;
  createdAt: IsoDate;
}

export interface ReviewItem {
  id: Id; // `${kind}:${refId}`
  kind: EntityKind;
  refId: Id;
  label: string;
  reason?: string;
  createdAt: IsoDate;
  dueAt: IsoDate;
  resolvedAt?: IsoDate;
}

export interface Note {
  id: Id;
  lessonId: Id;
  courseId: Id;
  text: string;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface Bookmark {
  id: 'last';
  domainId: Id;
  courseId: Id;
  lessonId: Id;
  lessonTitle: string;
  courseTitle: string;
  at: IsoDate;
}

/* ------------------------- Gamification & prefs ------------------------ */

export interface UnlockedBadge {
  id: Id;
  unlockedAt: IsoDate;
}

export interface BadgeDefinition {
  id: Id;
  label: string;
  description: string;
  icon: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Preferences {
  id: 'prefs';
  theme: ThemeMode;
  dailyGoalMinutes: number;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
  seedVersion: number;
  codeRunnerEndpoint: string;
}

export interface ProfileState {
  id: 'profile';
  xp: number;
  createdAt: IsoDate;
}

/* -------------------------------- Backup ------------------------------- */

export interface BackupFile {
  format: 'apprend-plus-backup';
  version: number;
  exportedAt: IsoDate;
  data: Record<string, unknown[]>;
}

export type AccentKey = 'violet' | 'green' | 'pink' | 'amber' | 'blue' | 'red' | 'teal';
