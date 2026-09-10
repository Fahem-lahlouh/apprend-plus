import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/repositories/db';
import { definitionRepository } from '@/repositories/definitionRepository';
import {
  DEFAULT_PROGRESS,
  EMPTY_TIMED_STATS,
  TIMED_MODES,
  adaptTimedLevel,
  applyTimedAnswer,
  buildLeaderboard,
  describeDefinition,
  hardestTargets,
  loadWeakness,
  nextLevel,
  recordExerciseResult,
  saveDefinition,
  saveTimedRun,
  timedScore,
  timedTier,
  weaknessFromStats,
} from '@/services/memorizationProgress';
import { generateExercise, seededRng } from '@/services/memorizationEngine';
import type { MemoExercise, MemoTargetStat } from '@/models';

async function reset() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
}

const stat = (key: string, attempts: number, errors: number): MemoTargetStat => ({
  id: `d::${key}`,
  definitionId: 'd',
  key,
  attempts,
  errors,
  lastSeenAt: '',
});

describe('niveau adaptatif', () => {
  it('monte d’un niveau toutes les trois bonnes réponses', () => {
    let progress = DEFAULT_PROGRESS('d');
    progress = nextLevel(progress, true);
    progress = nextLevel(progress, true);
    expect(progress.level).toBe(1);
    progress = nextLevel(progress, true);
    expect(progress.level).toBe(2);
    expect(progress.streak).toBe(3);
  });

  it('redescend et remet la série à zéro sur une erreur', () => {
    let progress = { ...DEFAULT_PROGRESS('d'), level: 5, streak: 2 };
    progress = nextLevel(progress, false);
    expect(progress.level).toBe(4);
    expect(progress.streak).toBe(0);
  });

  it('ne descend jamais sous le niveau 1', () => {
    const progress = nextLevel(DEFAULT_PROGRESS('d'), false);
    expect(progress.level).toBe(1);
  });

  it('compte les tentatives et les réussites', () => {
    let progress = DEFAULT_PROGRESS('d');
    progress = nextLevel(progress, true);
    progress = nextLevel(progress, false);
    expect(progress.attempts).toBe(2);
    expect(progress.correct).toBe(1);
  });
});

describe('points faibles', () => {
  it('renvoie un taux d’erreur borné', () => {
    const lookup = weaknessFromStats([stat('conteneur', 4, 3), stat('leger', 2, 0)]);
    expect(lookup('conteneur')).toBe(0.75);
    expect(lookup('leger')).toBe(0);
    expect(lookup('inconnu')).toBe(0);
  });

  it('classe les mots les plus ratés en premier', async () => {
    await reset();
    await definitionRepository.putTargetStat(stat('facile', 10, 1));
    await definitionRepository.putTargetStat(stat('dur', 4, 4));
    const hardest = await hardestTargets('d');
    expect(hardest[0].key).toBe('dur');
  });
});

describe('enregistrement d’un résultat', () => {
  beforeEach(reset);

  it('met à jour le niveau et les compteurs par mot', async () => {
    const definition = await saveDefinition({
      title: 'Docker',
      text: 'Docker isole une application dans un conteneur léger.',
    });
    const exercise = generateExercise(definition, {
      kind: 'fill_progressive',
      level: 1,
      rng: seededRng(3),
    })!;

    await recordExerciseResult(exercise, false);
    const stats = await definitionRepository.targetStats(definition.id);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats.every((entry) => entry.attempts === 1 && entry.errors === 1)).toBe(true);

    const progress = await definitionRepository.getProgress(definition.id);
    expect(progress?.attempts).toBe(1);
    expect(progress?.correct).toBe(0);
  });

  it('nourrit la recherche de points faibles utilisée par le moteur', async () => {
    const definition = await saveDefinition({
      title: 'Docker',
      text: 'Docker isole une application dans un conteneur léger.',
    });
    const exercise = generateExercise(definition, {
      kind: 'fill_progressive',
      level: 1,
      rng: seededRng(3),
    })!;
    await recordExerciseResult(exercise, false);

    const weakness = await loadWeakness(definition.id);
    expect(weakness(exercise.targetKeys[0])).toBe(1);
  });

  it('n’écrase pas les compteurs existants', async () => {
    const definition = await saveDefinition({ title: 'D', text: 'Docker isole une application.' });
    const exercise = { definitionId: definition.id, targetKeys: ['docker'] } as MemoExercise;
    await recordExerciseResult(exercise, false);
    await recordExerciseResult(exercise, true);
    const [entry] = await definitionRepository.targetStats(definition.id);
    expect(entry.attempts).toBe(2);
    expect(entry.errors).toBe(1);
  });
});

describe('enregistrement d’une définition', () => {
  beforeEach(reset);

  it('ne stocke que le texte, jamais d’exercices pré-générés', async () => {
    const definition = await saveDefinition({
      title: 'Spring Boot',
      text: 'Spring Boot simplifie la création d’applications Spring autonomes.',
    });
    expect(Object.keys(definition)).not.toContain('exercises');
    expect(await db.definitions.count()).toBe(1);
  });

  it('crée une flashcard miroir quand un domaine est choisi', async () => {
    const definition = await saveDefinition({
      title: 'Docker',
      text: 'Docker isole une application.',
      domainId: 'java',
    });
    expect(definition.flashcardId).toBeDefined();
    const card = await db.flashcards.get(definition.flashcardId!);
    expect(card?.front).toBe('Docker');
  });

  it('met à jour sans dupliquer', async () => {
    const first = await saveDefinition({ title: 'Docker', text: 'Un conteneur.' });
    const second = await saveDefinition({ id: first.id, title: 'Docker', text: 'Un conteneur léger.' });
    expect(second.id).toBe(first.id);
    expect(await db.definitions.count()).toBe(1);
    expect(second.text).toBe('Un conteneur léger.');
  });

  it('décrit la définition sans rien persister de plus', () => {
    const summary = describeDefinition({
      id: 'd',
      title: 'Docker',
      text: 'Docker isole une application dans un conteneur léger.',
      tags: [],
      createdAt: '',
      updatedAt: '',
    });
    expect(summary.sentences).toBe(1);
    expect(summary.keyWords.length).toBeGreaterThan(0);
  });
});

describe('mot manquant chronométré', () => {
  it('applique les quatre paliers demandés', () => {
    expect(timedTier(1)).toMatchObject({ name: 'Facile', timeLimitMs: 10_000, offerChoices: true });
    expect(timedTier(8)).toMatchObject({ name: 'Moyen', timeLimitMs: 7_000, offerChoices: true });
    expect(timedTier(13)).toMatchObject({ name: 'Difficile', timeLimitMs: 5_000, offerChoices: false });
    expect(timedTier(18)).toMatchObject({ name: 'Expert', timeLimitMs: 3_000, offerChoices: false });
  });

  it('monte quand la réponse est juste et rapide', () => {
    expect(adaptTimedLevel(5, { correct: true, elapsedMs: 2_000 })).toBe(6);
  });

  it('ne monte pas sur une bonne réponse lente', () => {
    expect(adaptTimedLevel(5, { correct: true, elapsedMs: 9_000 })).toBe(5);
  });

  it('redescend sur une erreur, sans passer sous 1', () => {
    expect(adaptTimedLevel(5, { correct: false, elapsedMs: 1_000 })).toBe(3);
    expect(adaptTimedLevel(1, { correct: false, elapsedMs: 1_000 })).toBe(1);
  });

  it('cumule les statistiques de session', () => {
    let stats = EMPTY_TIMED_STATS;
    stats = applyTimedAnswer(stats, { correct: true, elapsedMs: 2_000 });
    stats = applyTimedAnswer(stats, { correct: true, elapsedMs: 3_000 });
    stats = applyTimedAnswer(stats, { correct: false, elapsedMs: 5_000 });
    expect(stats.answered).toBe(3);
    expect(stats.correct).toBe(2);
    expect(stats.errors).toBe(1);
    expect(stats.bestStreak).toBe(2);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestMs).toBe(2_000);
  });

  it('ne retient pas le temps d’une mauvaise réponse comme meilleur temps', () => {
    const stats = applyTimedAnswer(EMPTY_TIMED_STATS, { correct: false, elapsedMs: 100 });
    expect(Number.isFinite(stats.bestMs)).toBe(false);
  });

  it('récompense la vitesse dans le score', () => {
    const slow = { ...EMPTY_TIMED_STATS, answered: 5, correct: 5, totalMs: 25_000, bestStreak: 5 };
    const fast = { ...EMPTY_TIMED_STATS, answered: 5, correct: 5, totalMs: 7_500, bestStreak: 5 };
    expect(timedScore(fast)).toBeGreaterThan(timedScore(slow));
  });

  it('vaut zéro sans aucune bonne réponse', () => {
    expect(timedScore({ ...EMPTY_TIMED_STATS, answered: 4, errors: 4 })).toBe(0);
  });

  it('propose les cinq modes demandés', () => {
    expect(TIMED_MODES.map((mode) => mode.id)).toEqual([
      'sprint60',
      'sprint180',
      'fixed10',
      'fixed20',
      'infinite',
    ]);
  });

  it('construit le classement personnel', async () => {
    await reset();
    await saveTimedRun({
      mode: 'fixed10',
      stats: { ...EMPTY_TIMED_STATS, answered: 10, correct: 8, bestStreak: 5, totalMs: 20_000, bestMs: 1_500 },
    });
    const runs = await definitionRepository.listTimedRuns();
    const board = buildLeaderboard(runs);
    expect(board.runs).toBe(1);
    expect(board.allTimeBest).toBeGreaterThan(0);
    expect(board.todayBest).toBe(board.allTimeBest);
    expect(board.bestStreak).toBe(5);
    expect(board.bestMs).toBe(1_500);
  });

  it('renvoie un classement neutre sans aucune partie', () => {
    expect(buildLeaderboard([])).toEqual({
      todayBest: 0,
      allTimeBest: 0,
      bestStreak: 0,
      bestMs: 0,
      runs: 0,
    });
  });
});
