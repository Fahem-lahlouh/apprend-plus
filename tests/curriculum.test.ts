import { describe, expect, it } from 'vitest';
import type { DefinitionProgress, Lesson, LessonProgress, QuizAttempt } from '@/models';
import {
  MASTERED_LEVEL,
  MEMORIZED_LEVEL,
  isSatisfied,
  lessonMastery,
  lessonsForConcepts,
  missingChain,
  prerequisiteStatuses,
  weakConcepts,
} from '@/services/curriculum';

function lesson(id: string, overrides: Partial<Lesson> = {}): Lesson {
  return {
    id,
    chapterId: 'ch',
    courseId: 'c',
    domainId: 'd',
    title: id,
    summary: '',
    estimatedMinutes: 5,
    order: 0,
    blocks: [],
    ...overrides,
  };
}

function progress(status: LessonProgress['status']): LessonProgress {
  return { lessonId: 'l', courseId: 'c', domainId: 'd', status, startedAt: '2026-01-01T00:00:00.000Z' };
}

function attempts(correct: number, wrong: number): QuizAttempt[] {
  const make = (ok: boolean, index: number): QuizAttempt => ({
    id: `a${ok ? 'y' : 'n'}${index}`,
    questionId: 'q',
    domainId: 'd',
    topic: 'sujet',
    correct: ok,
    answeredAt: '2026-01-01T00:00:00.000Z',
    source: 'lesson',
  });
  return [
    ...Array.from({ length: correct }, (_, i) => make(true, i)),
    ...Array.from({ length: wrong }, (_, i) => make(false, i)),
  ];
}

function definitionProgress(...levels: number[]): DefinitionProgress[] {
  return levels.map((level, index) => ({
    definitionId: `def${index}`,
    level,
    streak: 0,
    attempts: 0,
    correct: 0,
  }));
}

describe('lessonMastery', () => {
  it('reste « non commencé » tant qu’aucune progression n’existe', () => {
    const result = lessonMastery({ lesson: lesson('l'), attempts: [], definitionProgress: [] });
    expect(result.state).toBe('not_started');
  });

  it('ouvrir la leçon donne « découverte », pas davantage', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('in_progress'),
      attempts: [],
      definitionProgress: [],
    });
    expect(result.state).toBe('discovered');
  });

  it('passe « en cours » dès qu’une question a été répondue', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('in_progress'),
      attempts: attempts(1, 0),
      definitionProgress: [],
    });
    expect(result.state).toBe('in_progress');
  });

  it('terminer la leçon sans définition ni quiz donne « compris »', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('completed'),
      attempts: [],
      definitionProgress: [],
    });
    expect(result.state).toBe('understood');
    expect(result.accuracy).toBeNull();
  });

  it('un taux de réussite faible prime sur la leçon terminée', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('completed'),
      attempts: attempts(1, 4),
      definitionProgress: [],
    });
    expect(result.state).toBe('to_reinforce');
  });

  it('ignore un taux calculé sur trop peu de réponses', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('completed'),
      attempts: attempts(0, 2),
      definitionProgress: [],
    });
    expect(result.accuracy).toBeNull();
    expect(result.state).toBe('understood');
  });

  it('donne « mémorisé » quand les définitions sont sues mais le quiz moyen', () => {
    const result = lessonMastery({
      lesson: lesson('l', { definitionIds: ['def0'] }),
      progress: progress('completed'),
      attempts: attempts(7, 3),
      definitionProgress: definitionProgress(MEMORIZED_LEVEL + 1),
    });
    expect(result.state).toBe('memorized');
  });

  it('exige mémorisation et bon taux de réussite pour « maîtrisé »', () => {
    const result = lessonMastery({
      lesson: lesson('l', { definitionIds: ['def0'] }),
      progress: progress('completed'),
      attempts: attempts(9, 1),
      definitionProgress: definitionProgress(MASTERED_LEVEL),
    });
    expect(result.state).toBe('mastered');
  });

  it('sans définition, « maîtrisé » repose sur le seul taux de réussite', () => {
    const result = lessonMastery({
      lesson: lesson('l'),
      progress: progress('completed'),
      attempts: attempts(9, 1),
      definitionProgress: [],
    });
    expect(result.state).toBe('mastered');
  });

  it('une définition mémorisée ne suffit pas si le quiz est raté', () => {
    const result = lessonMastery({
      lesson: lesson('l', { definitionIds: ['def0'] }),
      progress: progress('completed'),
      attempts: attempts(2, 8),
      definitionProgress: definitionProgress(MASTERED_LEVEL + 5),
    });
    expect(result.state).toBe('to_reinforce');
  });
});

describe('prérequis', () => {
  const base = lesson('poly', { prerequisites: ['classe', 'heritage'] });
  const lessonsById = new Map([
    ['classe', lesson('classe')],
    ['heritage', lesson('heritage', { prerequisites: ['classe'] })],
    ['poly', base],
  ]);

  it('marque acquis à partir de « compris »', () => {
    expect(isSatisfied('understood')).toBe(true);
    expect(isSatisfied('memorized')).toBe(true);
    expect(isSatisfied('in_progress')).toBe(false);
    expect(isSatisfied('to_reinforce')).toBe(false);
  });

  it('rend l’état de chaque prérequis', () => {
    const states = new Map([['classe', 'mastered' as const], ['heritage', 'discovered' as const]]);
    const rows = prerequisiteStatuses(base, lessonsById, states);
    expect(rows.map((r) => [r.lessonId, r.satisfied])).toEqual([
      ['classe', true],
      ['heritage', false],
    ]);
  });

  it('ignore un prérequis pointant vers une leçon inexistante', () => {
    const orphan = lesson('x', { prerequisites: ['fantome'] });
    expect(prerequisiteStatuses(orphan, lessonsById, new Map())).toEqual([]);
  });

  it('remonte la chaîne manquante du plus fondamental au plus proche', () => {
    const chain = missingChain(base, lessonsById, new Map());
    expect(chain.map((l) => l.id)).toEqual(['classe', 'heritage']);
  });

  it('n’inclut pas les prérequis déjà acquis', () => {
    const states = new Map([['classe', 'mastered' as const]]);
    const chain = missingChain(base, lessonsById, states);
    expect(chain.map((l) => l.id)).toEqual(['heritage']);
  });

  it('ne boucle pas sur un cycle de prérequis', () => {
    const cyclic = new Map([
      ['a', lesson('a', { prerequisites: ['b'] })],
      ['b', lesson('b', { prerequisites: ['a'] })],
    ]);
    const chain = missingChain(cyclic.get('a')!, cyclic, new Map());
    expect(chain.map((l) => l.id)).toEqual(['b']);
  });
});

describe('weakConcepts', () => {
  it('classe les concepts par taux d’erreur', () => {
    const rows: QuizAttempt[] = [
      ...attempts(0, 4).map((a) => ({ ...a, topic: 'polymorphisme' })),
      ...attempts(3, 1).map((a) => ({ ...a, topic: 'héritage' })),
    ];
    const weak = weakConcepts(rows);
    expect(weak[0].concept).toBe('polymorphisme');
    expect(weak[0].errorRate).toBe(1);
    expect(weak[1].concept).toBe('héritage');
  });

  it('écarte les concepts sans erreur et ceux trop peu travaillés', () => {
    const rows: QuizAttempt[] = [
      ...attempts(5, 0).map((a) => ({ ...a, topic: 'streams' })),
      ...attempts(0, 1).map((a) => ({ ...a, topic: 'generics' })),
    ];
    expect(weakConcepts(rows)).toEqual([]);
  });

  it('retrouve les leçons qui travaillent un concept faible', () => {
    const lessons = [
      lesson('a', { concepts: ['polymorphisme'] }),
      lesson('b', { concepts: ['streams'] }),
    ];
    expect(lessonsForConcepts(lessons, ['polymorphisme']).map((l) => l.id)).toEqual(['a']);
  });
});
