import type {
  DefinitionProgress,
  Id,
  Lesson,
  LessonDifficulty,
  LessonProgress,
  MasteryState,
  QuizAttempt,
} from '@/models';

/**
 * Maîtrise et prérequis d'une leçon.
 *
 * Deux principes tiennent tout ce fichier :
 *
 * 1. La maîtrise est **calculée**, jamais stockée. Ouvrir une page produit au
 *    mieux « Découverte » ; il faut répondre juste et mémoriser pour monter.
 * 2. Le graphe de dépendances vient de `Lesson.prerequisites`, pas de l'ordre
 *    d'affichage : une leçon peut dépendre d'une notion vue dans un autre cours.
 */

/** Niveau de définition à partir duquel le texte est considéré mémorisé. */
export const MEMORIZED_LEVEL = 8;
/** Niveau de définition attendu pour la maîtrise complète. */
export const MASTERED_LEVEL = 13;
/** Réussite au quiz exigée pour « Compris », puis pour « Maîtrisé ». */
export const UNDERSTOOD_ACCURACY = 0.6;
export const MASTERED_ACCURACY = 0.8;
/** En dessous de ce nombre de réponses, le taux de réussite n'est pas fiable. */
const MIN_ATTEMPTS_FOR_SIGNAL = 3;

export const MASTERY_LABEL: Record<MasteryState, string> = {
  not_started: 'Non commencé',
  discovered: 'Découverte',
  in_progress: 'En cours',
  understood: 'Compris',
  to_reinforce: 'À renforcer',
  memorized: 'Mémorisé',
  mastered: 'Maîtrisé',
};

/** Ordre croissant, utilisé pour comparer deux états. */
export const MASTERY_ORDER: MasteryState[] = [
  'not_started',
  'discovered',
  'in_progress',
  'to_reinforce',
  'understood',
  'memorized',
  'mastered',
];

export const DIFFICULTY_LABEL: Record<LessonDifficulty, string> = {
  decouverte: 'Découverte',
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
  expert: 'Expert',
};

export interface MasteryInput {
  lesson: Lesson;
  progress?: LessonProgress;
  /** Réponses de quiz rattachées à cette leçon. */
  attempts: QuizAttempt[];
  /** Progression des définitions nées de la leçon. */
  definitionProgress: DefinitionProgress[];
}

export interface LessonMastery {
  lessonId: Id;
  state: MasteryState;
  label: string;
  /** null quand trop peu de réponses pour conclure. */
  accuracy: number | null;
  attempts: number;
  /** Niveau moyen des définitions de la leçon, 0 si aucune n'a été jouée. */
  memoLevel: number;
  definitionCount: number;
}

export function lessonMastery(input: MasteryInput): LessonMastery {
  const { lesson, progress, attempts, definitionProgress } = input;
  const answered = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const accuracy = answered >= MIN_ATTEMPTS_FOR_SIGNAL ? correct / answered : null;

  const definitionCount = lesson.definitionIds?.length ?? 0;
  const memoLevel =
    definitionProgress.length > 0
      ? definitionProgress.reduce((sum, p) => sum + p.level, 0) / definitionProgress.length
      : 0;

  const base: Omit<LessonMastery, 'state' | 'label'> = {
    lessonId: lesson.id,
    accuracy,
    attempts: answered,
    memoLevel,
    definitionCount,
  };

  const state = computeState({
    started: progress !== undefined,
    completed: progress?.status === 'completed',
    answered,
    accuracy,
    memoLevel,
    definitionCount,
  });

  return { ...base, state, label: MASTERY_LABEL[state] };
}

function computeState(signal: {
  started: boolean;
  completed: boolean;
  answered: number;
  accuracy: number | null;
  memoLevel: number;
  definitionCount: number;
}): MasteryState {
  if (!signal.started) return 'not_started';

  // Un taux de réussite bas prime sur tout le reste : la notion est fragile,
  // même si la leçon a été marquée terminée et le texte récité.
  if (signal.accuracy !== null && signal.accuracy < UNDERSTOOD_ACCURACY) return 'to_reinforce';

  if (!signal.completed) return signal.answered > 0 ? 'in_progress' : 'discovered';

  // Passé le garde-fou ci-dessus, un taux connu est forcément suffisant pour
  // « Compris » ; reste à savoir s'il atteint le seuil de maîtrise.
  const strong = signal.accuracy !== null && signal.accuracy >= MASTERED_ACCURACY;

  if (signal.definitionCount === 0) return strong ? 'mastered' : 'understood';
  if (signal.memoLevel >= MASTERED_LEVEL && strong) return 'mastered';
  if (signal.memoLevel >= MEMORIZED_LEVEL) return 'memorized';
  return 'understood';
}

/* ----------------------------- Prérequis ------------------------------- */

export interface PrerequisiteStatus {
  lessonId: Id;
  title: string;
  state: MasteryState;
  label: string;
  /** true dès que la notion est au moins comprise. */
  satisfied: boolean;
}

/** Une notion compte comme acquise à partir de « Compris ». */
export function isSatisfied(state: MasteryState): boolean {
  return MASTERY_ORDER.indexOf(state) >= MASTERY_ORDER.indexOf('understood');
}

export function prerequisiteStatuses(
  lesson: Lesson,
  lessonsById: Map<Id, Lesson>,
  masteryByLesson: Map<Id, MasteryState>,
): PrerequisiteStatus[] {
  return (lesson.prerequisites ?? []).flatMap((id) => {
    const required = lessonsById.get(id);
    if (!required) return [];
    const state = masteryByLesson.get(id) ?? 'not_started';
    return [{ lessonId: id, title: required.title, state, label: MASTERY_LABEL[state], satisfied: isSatisfied(state) }];
  });
}

/**
 * Prérequis manquants en profondeur : si « Héritage » n'est pas acquis et que
 * lui-même dépend de « Classe », les deux remontent, du plus fondamental au
 * plus proche. C'est cette liste qui indique par où reprendre.
 */
export function missingChain(
  lesson: Lesson,
  lessonsById: Map<Id, Lesson>,
  masteryByLesson: Map<Id, MasteryState>,
): Lesson[] {
  const missing: Lesson[] = [];
  const seen = new Set<Id>([lesson.id]);

  const walk = (current: Lesson) => {
    for (const id of current.prerequisites ?? []) {
      if (seen.has(id)) continue;
      seen.add(id);
      const required = lessonsById.get(id);
      if (!required) continue;
      if (isSatisfied(masteryByLesson.get(id) ?? 'not_started')) continue;
      walk(required);
      missing.push(required);
    }
  };

  walk(lesson);
  return missing;
}

/**
 * Concepts sur lesquels l'utilisateur se trompe le plus, toutes leçons
 * confondues. Sert à re-proposer les bons exercices : la sélection se fait sur
 * `Lesson.concepts`, donc aucune notion n'est nommée dans le code.
 */
export interface WeakConcept {
  concept: string;
  attempts: number;
  errors: number;
  errorRate: number;
}

export function weakConcepts(
  attempts: QuizAttempt[],
  options: { minAttempts?: number; limit?: number } = {},
): WeakConcept[] {
  const minAttempts = options.minAttempts ?? MIN_ATTEMPTS_FOR_SIGNAL;
  const tally = new Map<string, { attempts: number; errors: number }>();

  for (const attempt of attempts) {
    if (!attempt.topic) continue;
    const row = tally.get(attempt.topic) ?? { attempts: 0, errors: 0 };
    row.attempts += 1;
    if (!attempt.correct) row.errors += 1;
    tally.set(attempt.topic, row);
  }

  return [...tally.entries()]
    .filter(([, row]) => row.attempts >= minAttempts && row.errors > 0)
    .map(([concept, row]) => ({
      concept,
      attempts: row.attempts,
      errors: row.errors,
      errorRate: row.errors / row.attempts,
    }))
    .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
    .slice(0, options.limit ?? 5);
}

/** Leçons qui travaillent l'un des concepts donnés, pour re-cibler la révision. */
export function lessonsForConcepts(lessons: Lesson[], concepts: string[]): Lesson[] {
  const wanted = new Set(concepts);
  return lessons.filter((lesson) => (lesson.concepts ?? []).some((c) => wanted.has(c)));
}
