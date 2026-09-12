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
  /** Effort demandé, affiché avant d'ouvrir la leçon. */
  difficulty?: LessonDifficulty;
  /**
   * Leçons à comprendre avant celle-ci. C'est la seule source du graphe de
   * dépendances : l'ordre d'affichage ne suffit pas à dire ce qui est requis.
   */
  prerequisites?: Id[];
  /**
   * Définitions issues de cette leçon. Elles sont créées au seed et jouables
   * immédiatement par le moteur de mémorisation, sans configuration.
   */
  definitionIds?: Id[];
  /** Étiquettes fines de compétence, utilisées par l'analyse des erreurs. */
  concepts?: string[];
}

export type LessonDifficulty = 'decouverte' | 'facile' | 'moyen' | 'difficile' | 'expert';

/**
 * État de maîtrise d'une leçon. Calculé, jamais stocké : ouvrir une page ne
 * peut donc pas faire croire à une notion maîtrisée.
 */
export type MasteryState =
  | 'not_started'
  | 'discovered'
  | 'in_progress'
  | 'understood'
  | 'to_reinforce'
  | 'memorized'
  | 'mastered';

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
  | PronunciationBlock
  | WhyBlock
  | CodeExplainBlock
  | QuestionBlock
  | CompareBlock
  | BadGoodBlock
  | StepsBlock
  | MemorizeBlock
  | InterviewBlock
  | FlowBlock
  | IncidentBlock;

export interface TextBlock {
  kind: 'text';
  title?: string;
  text: string;
}
export interface DefinitionBlock {
  kind: 'definition';
  term: string;
  text: string;
  /** true = formulation technique, affichée sous la définition simple. */
  technical?: boolean;
}

/** « Pourquoi on fait ça ? » - l'utilité réelle, pas la définition. */
export interface WhyBlock {
  kind: 'why';
  question: string;
  text: string;
}

/** Explication d'un extrait, ligne par ligne. */
export interface CodeExplainBlock {
  kind: 'codeExplain';
  title?: string;
  lines: { code: string; explain: string }[];
}

/** Question de compréhension : l'utilisateur réfléchit avant de révéler. */
export interface QuestionBlock {
  kind: 'question';
  question: string;
  answer: string;
}

/** Tableau de comparaison à deux colonnes (interface vs classe abstraite...). */
export interface CompareBlock {
  kind: 'compare';
  title?: string;
  headers: [string, string];
  rows: { label: string; left: string; right: string }[];
}

/** Mauvaise version puis bonne version du même code, avec la raison. */
export interface BadGoodBlock {
  kind: 'badGood';
  language: CodeLanguage;
  title?: string;
  bad: string;
  good: string;
  why: string;
}

/** Méthodologie ordonnée : diagnostiquer une API lente, par exemple. */
export interface StepsBlock {
  kind: 'steps';
  title?: string;
  steps: string[];
}

/** Passerelle vers le moteur de mémorisation pour une définition de la leçon. */
export interface MemorizeBlock {
  kind: 'memorize';
  definitionId: Id;
  label?: string;
}

/**
 * « Comment l'expliquer en entretien ? »
 *
 * Deux niveaux plutôt qu'un seul : réciter une définition ne suffit pas en
 * entretien, il faut d'abord placer une réponse tenable en trente secondes,
 * puis savoir la dérouler. Les relances sont les questions qui tombent
 * réellement juste après, une fois la première réponse donnée.
 */
export interface InterviewBlock {
  kind: 'interview';
  question: string;
  /** Réponse tenable à l'oral en 20 à 30 secondes. */
  shortAnswer: string;
  /** Développement d'une à deux minutes. */
  detailedAnswer: string;
  followUps?: FollowUp[];
}

export interface FollowUp {
  question: string;
  answer: string;
}

/**
 * Chaîne de composants (« Client → API → Service → Base »).
 *
 * Chaque maillon porte les questions qu'on doit pouvoir répondre sur lui, pour
 * que la chaîne s'apprenne comme un raisonnement et non comme un schéma.
 */
export interface FlowBlock {
  kind: 'flow';
  title?: string;
  steps: FlowStep[];
}

export interface FlowStep {
  label: string;
  /** Rôle en une ligne, visible sans déplier. */
  role: string;
  /** Ce que le composant fait réellement. */
  what: string;
  /** Ce qui casse ou se dégrade si on l'enlève. */
  without: string;
  /** Alternatives crédibles, quand il y en a. */
  alternatives?: string;
}

/**
 * Méthode de diagnostic d'un incident.
 *
 * L'ordre des champs est la méthode elle-même : on part du symptôme observé,
 * pas d'une correction supposée.
 */
export interface IncidentBlock {
  kind: 'incident';
  symptom: string;
  /** Où regarder en premier. */
  where: string[];
  /** Informations à récupérer avant toute hypothèse. */
  collect: string[];
  /** Hypothèses plausibles, et comment trancher chacune. */
  hypotheses: { cause: string; confirm: string }[];
  fix: string;
  /** Comment vérifier que c'est réellement corrigé. */
  validate: string;
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
  /**
   * Réponse courte tenable à l'oral, pour le mode entretien. `answer` reste la
   * réponse de référence ; celle-ci est ce qu'on dit en premier.
   */
  shortAnswer?: string;
  /** Questions qui tombent juste après, une fois la réponse donnée. */
  followUps?: FollowUp[];
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

/* ------------------------------------------------------------------ */
/* Mémorisation : définitions et moteur d'exercices                    */
/* ------------------------------------------------------------------ */

/**
 * Une définition est la seule chose que l'utilisateur saisit. Tous les jeux de
 * mémorisation sont dérivés de son texte par analyse, à la volée.
 *
 * Rien d'autre n'est stocké : ni exercices pré-générés, ni découpage, ni mots
 * importants. C'est ce qui garantit qu'un nouveau type de jeu ajouté plus tard
 * fonctionne immédiatement sur toutes les définitions déjà enregistrées, sans
 * migration.
 */
export interface Definition {
  id: Id;
  title: string;
  text: string;
  domainId?: Id;
  courseId?: Id;
  lessonId?: Id;
  tags: string[];
  /** Carte de révision créée automatiquement, branchée sur le moteur SRS. */
  flashcardId?: Id;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

/** Identifiant d'un type de jeu. Volontairement une chaîne : le registre est ouvert. */
export type MemoGameKind = string;

/**
 * Les cinq formes d'interaction. Un nouveau jeu réutilise une forme existante
 * (et n'a donc aucun composant à écrire) ou en ajoute une seule.
 */
export type ExerciseShape =
  | FillBlankShape
  | ReorderShape
  | TrueFalseShape
  | ChoiceShape
  | FindErrorShape
  | RecallShape;

export interface FillBlankShape {
  shape: 'fillBlank';
  /** Alternance de texte brut et de trous, pour un rendu exact de la phrase. */
  parts: FillBlankPart[];
  blanks: FillBlankSlot[];
}

export type FillBlankPart = { text: string } | { blankId: string };

export interface FillBlankSlot {
  id: string;
  answer: string;
  /** Absent quand l'utilisateur doit écrire la réponse. */
  options?: string[];
}

export interface ReorderShape {
  shape: 'reorder';
  items: string[];
  correctOrder: string[];
  unit: 'word' | 'chunk';
}

export interface TrueFalseShape {
  shape: 'trueFalse';
  statement: string;
  isTrue: boolean;
  correctedStatement?: string;
}

export interface ChoiceShape {
  shape: 'choice';
  options: string[];
  correctIndex: number;
}

export interface FindErrorShape {
  shape: 'findError';
  tokens: string[];
  wrongIndex: number;
  correctWord: string;
}

export interface RecallShape {
  shape: 'recall';
  answer: string;
  /** true = comparaison textuelle automatique, false = auto-évaluation. */
  autoGrade: boolean;
}

/** Un exercice généré. Jamais stocké : produit à la demande, puis jeté. */
export interface MemoExercise {
  id: string;
  kind: MemoGameKind;
  definitionId: Id;
  level: number;
  /** Consigne affichée au-dessus de l'exercice. */
  instruction: string;
  /** Phrase ou question présentée. */
  prompt: string;
  body: ExerciseShape;
  /** Clés des mots/expressions travaillés, pour le suivi des points faibles. */
  targetKeys: string[];
  /** Phrase d'origine complète, réaffichée après la réponse. */
  sourceSentence: string;
  /** Limite de temps, uniquement pour les jeux chronométrés. */
  timeLimitMs?: number;
}

/** Niveau adaptatif et compteurs, une ligne par définition. */
export interface DefinitionProgress {
  definitionId: Id;
  level: number;
  streak: number;
  attempts: number;
  correct: number;
  lastPlayedAt?: IsoDate;
}

/**
 * Point faible mesuré : une entrée par mot ou expression sur lequel
 * l'utilisateur a été interrogé. Sert à re-cibler les trous des prochains
 * exercices.
 */
export interface MemoTargetStat {
  /** `${definitionId}::${normalisation du mot}` */
  id: Id;
  definitionId: Id;
  key: string;
  attempts: number;
  errors: number;
  lastSeenAt: IsoDate;
}

/* ----------------------- Mot manquant chronométré ---------------------- */

export type TimedMode = 'sprint60' | 'sprint180' | 'fixed10' | 'fixed20' | 'infinite';

export interface TimedRun {
  id: Id;
  mode: TimedMode;
  definitionId?: Id;
  day: DayKey;
  score: number;
  answered: number;
  correct: number;
  errors: number;
  bestStreak: number;
  averageMs: number;
  bestMs: number;
  finishedAt: IsoDate;
}
