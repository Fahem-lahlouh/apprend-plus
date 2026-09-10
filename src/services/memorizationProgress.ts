import type {
  Definition,
  DefinitionProgress,
  Id,
  MemoExercise,
  MemoTargetStat,
  TimedMode,
  TimedRun,
} from '@/models';
import { definitionRepository } from '@/repositories/definitionRepository';
import { contentRepository } from '@/repositories/contentRepository';
import { analyzeDefinition } from './textAnalysis';
import { MAX_LEVEL, type WeaknessLookup } from './memorizationEngine';
import { newId } from '@/utils/id';
import { toDayKey } from '@/utils/date';

/**
 * Couche d'état de la mémorisation : niveau adaptatif par définition et
 * mesure des points faibles. Le moteur reste pur ; c'est ici qu'on écrit.
 */

export const DEFAULT_PROGRESS = (definitionId: Id): DefinitionProgress => ({
  definitionId,
  level: 1,
  streak: 0,
  attempts: 0,
  correct: 0,
});

/** Trois bonnes réponses d'affilée font monter d'un niveau, une erreur en fait perdre un. */
export function nextLevel(progress: DefinitionProgress, correct: boolean): DefinitionProgress {
  const streak = correct ? progress.streak + 1 : 0;
  let level = progress.level;
  if (correct && streak > 0 && streak % 3 === 0) level = Math.min(MAX_LEVEL, level + 1);
  if (!correct) level = Math.max(1, level - 1);
  return {
    ...progress,
    level,
    streak,
    attempts: progress.attempts + 1,
    correct: progress.correct + (correct ? 1 : 0),
    lastPlayedAt: new Date().toISOString(),
  };
}

/** Taux d'erreur par mot, borné, tel que le moteur l'attend. */
export function weaknessFromStats(stats: MemoTargetStat[]): WeaknessLookup {
  const map = new Map(stats.map((stat) => [stat.key, stat]));
  return (key: string) => {
    const stat = map.get(key);
    if (!stat || stat.attempts === 0) return 0;
    return Math.min(1, stat.errors / stat.attempts);
  };
}

export async function loadWeakness(definitionId: Id): Promise<WeaknessLookup> {
  return weaknessFromStats(await definitionRepository.targetStats(definitionId));
}

export async function loadProgress(definitionId: Id): Promise<DefinitionProgress> {
  return (await definitionRepository.getProgress(definitionId)) ?? DEFAULT_PROGRESS(definitionId);
}

/**
 * Enregistre le résultat d'un exercice : niveau adaptatif, et surtout compteurs
 * par mot. C'est ce qui fait que les prochains exercices insistent sur ce qui
 * bloque.
 */
export async function recordExerciseResult(
  exercise: MemoExercise,
  correct: boolean,
): Promise<DefinitionProgress> {
  const progress = nextLevel(await loadProgress(exercise.definitionId), correct);
  await definitionRepository.putProgress(progress);

  const now = new Date().toISOString();
  const existing = await definitionRepository.targetStats(exercise.definitionId);
  const byKey = new Map(existing.map((stat) => [stat.key, stat]));

  for (const key of new Set(exercise.targetKeys)) {
    const current = byKey.get(key);
    await definitionRepository.putTargetStat({
      id: `${exercise.definitionId}::${key}`,
      definitionId: exercise.definitionId,
      key,
      attempts: (current?.attempts ?? 0) + 1,
      errors: (current?.errors ?? 0) + (correct ? 0 : 1),
      lastSeenAt: now,
    });
  }

  return progress;
}

/** Mots les plus ratés d'une définition, pour l'écran de suivi. */
export async function hardestTargets(definitionId: Id, limit = 5): Promise<MemoTargetStat[]> {
  const stats = await definitionRepository.targetStats(definitionId);
  return stats
    .filter((stat) => stat.errors > 0)
    .sort((a, b) => b.errors / b.attempts - a.errors / a.attempts || b.errors - a.errors)
    .slice(0, limit);
}

/* ---------------------------- Cycle de vie ------------------------------ */

/**
 * Enregistre une définition. Rien n'est pré-généré : l'analyse est refaite à
 * chaque partie depuis le texte, donc tous les jeux, présents comme futurs,
 * fonctionnent immédiatement.
 *
 * Seule action annexe : une flashcard miroir, pour brancher la définition sur
 * le moteur de répétition espacée déjà en place.
 */
export async function saveDefinition(input: {
  id?: Id;
  title: string;
  text: string;
  domainId?: Id;
  courseId?: Id;
  tags?: string[];
}): Promise<Definition> {
  const now = new Date().toISOString();
  const existing = input.id ? await definitionRepository.get(input.id) : undefined;

  const definition: Definition = {
    id: existing?.id ?? newId('def'),
    title: input.title.trim(),
    text: input.text.trim(),
    domainId: input.domainId,
    courseId: input.courseId,
    tags: input.tags ?? existing?.tags ?? [],
    flashcardId: existing?.flashcardId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (definition.domainId) {
    const flashcardId = definition.flashcardId ?? `fc-${definition.id}`;
    await contentRepository.putFlashcard({
      id: flashcardId,
      domainId: definition.domainId,
      courseId: definition.courseId,
      front: definition.title,
      back: definition.text,
      tags: definition.tags,
      createdAt: existing?.createdAt ?? now,
    });
    definition.flashcardId = flashcardId;
  }

  await definitionRepository.put(definition);
  return definition;
}

/** Nombre de phrases et de mots, affiché après l'enregistrement. */
export function describeDefinition(definition: Definition) {
  const analysis = analyzeDefinition(definition.text);
  return {
    sentences: analysis.sentences.length,
    words: analysis.wordCount,
    keyWords: analysis.importantTokens.slice(0, 8).map((token) => token.text),
    keyPhrases: analysis.importantPhrases.slice(0, 5).map((phrase) => phrase.text),
  };
}

/* ------------------------ Mot manquant chronométré ---------------------- */

export interface TimedTier {
  name: string;
  timeLimitMs: number;
  offerChoices: boolean;
  level: number;
}

/**
 * Les quatre paliers du jeu chronométré. Le temps vient du palier, la forme
 * des trous vient du niveau : un seul mot avec choix au début, des expressions
 * entières sans aide à la fin.
 */
export function timedTier(level: number): TimedTier {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.round(level)));
  if (clamped <= 5) return { name: 'Facile', timeLimitMs: 10_000, offerChoices: true, level: clamped };
  if (clamped <= 10) return { name: 'Moyen', timeLimitMs: 7_000, offerChoices: true, level: clamped };
  if (clamped <= 15) return { name: 'Difficile', timeLimitMs: 5_000, offerChoices: false, level: clamped };
  return { name: 'Expert', timeLimitMs: 3_000, offerChoices: false, level: clamped };
}

/**
 * Difficulté qui suit les performances : une réponse juste et rapide fait
 * monter, une erreur fait redescendre d'un cran. Le temps ne descend jamais
 * brutalement, il suit le palier.
 */
export function adaptTimedLevel(level: number, outcome: { correct: boolean; elapsedMs: number }): number {
  const tier = timedTier(level);
  if (!outcome.correct) return Math.max(1, level - 2);
  const fast = outcome.elapsedMs <= tier.timeLimitMs * 0.5;
  return Math.min(MAX_LEVEL, level + (fast ? 1 : 0));
}

export const TIMED_MODES: { id: TimedMode; label: string; hint: string }[] = [
  { id: 'sprint60', label: 'Sprint 1 minute', hint: 'Un maximum de bonnes réponses en 60 s' },
  { id: 'sprint180', label: 'Sprint 3 minutes', hint: 'Le format long, 180 s' },
  { id: 'fixed10', label: '10 questions', hint: 'Série courte' },
  { id: 'fixed20', label: '20 questions', hint: 'Série complète' },
  { id: 'infinite', label: 'Mode infini', hint: 'Jusqu’à 3 erreurs d’affilée' },
];

export interface TimedSessionStats {
  answered: number;
  correct: number;
  errors: number;
  bestStreak: number;
  currentStreak: number;
  totalMs: number;
  bestMs: number;
}

export const EMPTY_TIMED_STATS: TimedSessionStats = {
  answered: 0,
  correct: 0,
  errors: 0,
  bestStreak: 0,
  currentStreak: 0,
  totalMs: 0,
  bestMs: Number.POSITIVE_INFINITY,
};

export function applyTimedAnswer(
  stats: TimedSessionStats,
  outcome: { correct: boolean; elapsedMs: number },
): TimedSessionStats {
  const currentStreak = outcome.correct ? stats.currentStreak + 1 : 0;
  return {
    answered: stats.answered + 1,
    correct: stats.correct + (outcome.correct ? 1 : 0),
    errors: stats.errors + (outcome.correct ? 0 : 1),
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    totalMs: stats.totalMs + outcome.elapsedMs,
    bestMs: outcome.correct ? Math.min(stats.bestMs, outcome.elapsedMs) : stats.bestMs,
  };
}

/** Score : une bonne réponse vaut d'autant plus qu'elle est rapide. */
export function timedScore(stats: TimedSessionStats): number {
  if (stats.correct === 0) return 0;
  const averageMs = stats.totalMs / Math.max(1, stats.answered);
  const speedBonus = Math.max(0, Math.round((6000 - averageMs) / 500));
  return stats.correct * 10 + speedBonus + stats.bestStreak * 5;
}

export async function saveTimedRun(input: {
  mode: TimedMode;
  definitionId?: Id;
  stats: TimedSessionStats;
}): Promise<TimedRun> {
  const run: TimedRun = {
    id: newId('run'),
    mode: input.mode,
    definitionId: input.definitionId,
    day: toDayKey(),
    score: timedScore(input.stats),
    answered: input.stats.answered,
    correct: input.stats.correct,
    errors: input.stats.errors,
    bestStreak: input.stats.bestStreak,
    averageMs: input.stats.answered === 0 ? 0 : Math.round(input.stats.totalMs / input.stats.answered),
    bestMs: Number.isFinite(input.stats.bestMs) ? Math.round(input.stats.bestMs) : 0,
    finishedAt: new Date().toISOString(),
  };
  await definitionRepository.addTimedRun(run);
  return run;
}

export interface TimedLeaderboard {
  todayBest: number;
  allTimeBest: number;
  bestStreak: number;
  bestMs: number;
  runs: number;
}

export function buildLeaderboard(runs: TimedRun[], today = toDayKey()): TimedLeaderboard {
  const withTimes = runs.filter((run) => run.bestMs > 0);
  return {
    todayBest: Math.max(0, ...runs.filter((run) => run.day === today).map((run) => run.score)),
    allTimeBest: Math.max(0, ...runs.map((run) => run.score)),
    bestStreak: Math.max(0, ...runs.map((run) => run.bestStreak)),
    bestMs: withTimes.length === 0 ? 0 : Math.min(...withTimes.map((run) => run.bestMs)),
    runs: runs.length,
  };
}
