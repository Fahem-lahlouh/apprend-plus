import { describe, expect, it } from 'vitest';
import { buildDomain } from '@/data/seed/builders';
import { javaDomain } from '@/data/seed/java';
import { stackDomain } from '@/data/seed/stack';
import { analyzeDefinition } from '@/services/textAnalysis';
import { GAME_REGISTRY, availableGames, generateExercise } from '@/services/memorizationEngine';
import { INTERVIEW_TAG } from '@/features/games/InterviewScreen';
import type { IncidentBlock, InterviewBlock, Lesson } from '@/models';

const stack = buildDomain(stackDomain, 1, '2026-01-01T00:00:00.000Z');
const java = buildDomain(javaDomain, 0, '2026-01-01T00:00:00.000Z');

/**
 * Le parcours technique s'appuie sur le parcours Java : ses prérequis pointent
 * vers des leçons de l'autre domaine. Le graphe se vérifie donc sur l'union des
 * deux, exactement comme l'écran de leçon le résout.
 */
const allLessons: Lesson[] = [...java.lessons, ...stack.lessons];
const lessonsById = new Map(allLessons.map((l) => [l.id, l]));
const lessonOrder = new Map(allLessons.map((l, index) => [l.id, index]));

const stackLessonIds = new Set(stack.lessons.map((l) => l.id));
const questionIds = new Set(stack.questions.map((q) => q.id));
const definitionIds = new Set(stack.definitions.map((d) => d.id));

describe('structure du parcours technique', () => {
  it('déclare les dix familles dans l’ordre', () => {
    expect(stack.paths.map((p) => p.id)).toEqual([
      'stack-path-java-avance',
      'stack-path-ecosysteme',
      'stack-path-api',
      'stack-path-messaging',
      'stack-path-donnees',
      'stack-path-devops',
      'stack-path-observabilite',
      'stack-path-performance',
      'stack-path-architecture',
      'stack-path-entretien',
    ]);
  });

  it('rattache chaque cours à une famille existante', () => {
    const pathIds = new Set(stack.paths.map((p) => p.id));
    for (const course of stack.courses) {
      expect(course.pathId, `cours ${course.id}`).toBeDefined();
      expect(pathIds.has(course.pathId!), `cours ${course.id}`).toBe(true);
    }
  });

  it('n’utilise que des identifiants uniques', () => {
    expect(new Set(stack.lessons.map((l) => l.id)).size).toBe(stack.lessons.length);
    expect(new Set(stack.chapters.map((c) => c.id)).size).toBe(stack.chapters.length);
    expect(new Set(stack.questions.map((q) => q.id)).size).toBe(stack.questions.length);
    expect(new Set(stack.definitions.map((d) => d.id)).size).toBe(stack.definitions.length);
  });

  it('n’entre en collision avec aucun identifiant du domaine Java', () => {
    const javaIds = new Set([
      ...java.lessons.map((l) => l.id),
      ...java.chapters.map((c) => c.id),
      ...java.courses.map((c) => c.id),
      ...java.questions.map((q) => q.id),
      ...java.definitions.map((d) => d.id),
    ]);
    const stackIds = [
      ...stack.lessons.map((l) => l.id),
      ...stack.chapters.map((c) => c.id),
      ...stack.courses.map((c) => c.id),
      ...stack.questions.map((q) => q.id),
      ...stack.definitions.map((d) => d.id),
    ];
    for (const id of stackIds) {
      expect(javaIds.has(id), `identifiant déjà pris par le domaine Java : ${id}`).toBe(false);
    }
  });

  it('attache chaque chapitre à un cours existant', () => {
    const courseIds = new Set(stack.courses.map((c) => c.id));
    for (const chapter of stack.chapters) {
      expect(courseIds.has(chapter.courseId), `chapitre ${chapter.id}`).toBe(true);
    }
  });

  it('numérote les leçons sans repartir de zéro à chaque chapitre', () => {
    for (const course of stack.courses) {
      const orders = stack.lessons.filter((l) => l.courseId === course.id).map((l) => l.order);
      expect(orders, `cours ${course.id}`).toEqual(Array.from({ length: orders.length }, (_, i) => i));
    }
  });

  it('donne à chaque leçon un titre, un résumé et une durée', () => {
    for (const lesson of stack.lessons) {
      expect(lesson.title.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.summary.length, lesson.id).toBeGreaterThan(0);
      expect(lesson.estimatedMinutes, lesson.id).toBeGreaterThan(0);
      expect(lesson.blocks.length, lesson.id).toBeGreaterThan(0);
    }
  });
});

describe('graphe de prérequis', () => {
  it('ne pointe que vers des leçons existantes', () => {
    for (const lesson of stack.lessons) {
      for (const required of lesson.prerequisites ?? []) {
        expect(lessonsById.has(required), `${lesson.id} exige ${required}`).toBe(true);
      }
    }
  });

  it('ne dépend jamais d’une leçon qui vient après', () => {
    for (const lesson of stack.lessons) {
      for (const required of lesson.prerequisites ?? []) {
        expect(
          lessonOrder.get(required)! < lessonOrder.get(lesson.id)!,
          `${lesson.id} exige ${required}, qui vient plus tard`,
        ).toBe(true);
      }
    }
  });

  it('ne contient aucun cycle', () => {
    const visiting = new Set<string>();
    const done = new Set<string>();

    const walk = (id: string, chain: string[]) => {
      if (done.has(id)) return;
      expect(visiting.has(id), `cycle : ${[...chain, id].join(' → ')}`).toBe(false);
      visiting.add(id);
      for (const required of lessonsById.get(id)?.prerequisites ?? []) {
        walk(required, [...chain, id]);
      }
      visiting.delete(id);
      done.add(id);
    };

    for (const lesson of stack.lessons) walk(lesson.id, []);
  });

  it('s’appuie réellement sur le parcours Java', () => {
    const javaIds = new Set(java.lessons.map((l) => l.id));
    const crossDomain = stack.lessons.flatMap((l) => (l.prerequisites ?? []).filter((id) => javaIds.has(id)));
    expect(crossDomain.length).toBeGreaterThan(0);
  });
});

describe('références internes des leçons', () => {
  it('ne cite que des questions existantes dans les blocs quiz', () => {
    for (const lesson of stack.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind === 'quiz') {
          expect(questionIds.has(block.questionId), `${lesson.id} cite ${block.questionId}`).toBe(true);
        }
      }
    }
  });

  it('ne cite que des définitions existantes dans les blocs memorize', () => {
    for (const lesson of stack.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind === 'memorize') {
          expect(definitionIds.has(block.definitionId), `${lesson.id} cite ${block.definitionId}`).toBe(true);
        }
      }
    }
  });

  it('rattache chaque question à une leçon du domaine', () => {
    for (const question of stack.questions) {
      expect(question.lessonId, question.id).toBeDefined();
      expect(stackLessonIds.has(question.lessonId!), `question ${question.id}`).toBe(true);
      expect(question.explanation.length, question.id).toBeGreaterThan(20);
    }
  });

  it('place toujours la bonne réponse parmi les options proposées', () => {
    for (const question of stack.questions) {
      if (question.options && question.options.length > 0) {
        expect(question.options, question.id).toContain(question.answer);
        expect(new Set(question.options).size, `options dupliquées : ${question.id}`).toBe(question.options.length);
      }
    }
  });
});

describe('blocs pédagogiques du parcours', () => {
  const interviews = stack.lessons.flatMap((l) =>
    l.blocks.filter((b): b is InterviewBlock => b.kind === 'interview'),
  );
  const incidents = stack.lessons.flatMap((l) =>
    l.blocks.filter((b): b is IncidentBlock => b.kind === 'incident'),
  );

  it('donne deux niveaux de réponse à chaque bloc entretien', () => {
    expect(interviews.length).toBeGreaterThan(10);
    for (const block of interviews) {
      expect(block.question.length).toBeGreaterThan(10);
      expect(block.shortAnswer.length, block.question).toBeGreaterThan(60);
      // Le développement doit réellement développer, pas répéter la réponse courte.
      expect(block.detailedAnswer.length, block.question).toBeGreaterThan(block.shortAnswer.length);
    }
  });

  it('propose des relances exploitables', () => {
    const withFollowUps = interviews.filter((b) => (b.followUps ?? []).length > 0);
    expect(withFollowUps.length).toBeGreaterThan(8);
    for (const block of withFollowUps) {
      for (const followUp of block.followUps!) {
        expect(followUp.question.length, block.question).toBeGreaterThan(5);
        expect(followUp.answer.length, followUp.question).toBeGreaterThan(40);
      }
    }
  });

  it('décrit chaque incident du symptôme jusqu’à la validation', () => {
    expect(incidents.length).toBeGreaterThanOrEqual(5);
    for (const block of incidents) {
      expect(block.symptom.length).toBeGreaterThan(10);
      expect(block.where.length, block.symptom).toBeGreaterThan(1);
      expect(block.collect.length, block.symptom).toBeGreaterThan(1);
      expect(block.hypotheses.length, block.symptom).toBeGreaterThan(1);
      for (const hypothesis of block.hypotheses) {
        // Une hypothèse sans moyen de trancher n'apprend rien.
        expect(hypothesis.confirm.length, hypothesis.cause).toBeGreaterThan(30);
      }
      expect(block.fix.length, block.symptom).toBeGreaterThan(30);
      expect(block.validate.length, block.symptom).toBeGreaterThan(30);
    }
  });

  it('justifie chaque maillon des chaînes de composants', () => {
    const flows = stack.lessons.flatMap((l) => l.blocks.filter((b) => b.kind === 'flow'));
    expect(flows.length).toBeGreaterThan(3);
    for (const block of flows) {
      if (block.kind !== 'flow') continue;
      expect(block.steps.length).toBeGreaterThan(2);
      for (const step of block.steps) {
        expect(step.role.length, step.label).toBeGreaterThan(5);
        expect(step.what.length, step.label).toBeGreaterThan(30);
        expect(step.without.length, step.label).toBeGreaterThan(20);
      }
    }
  });
});

describe('mémorisation des définitions du parcours', () => {
  it('rattache chaque définition à sa leçon', () => {
    for (const definition of stack.definitions) {
      expect(definition.lessonId, definition.id).toBeDefined();
      expect(stackLessonIds.has(definition.lessonId!), `définition ${definition.id}`).toBe(true);
      expect(definition.domainId, definition.id).toBe('stack');
    }
  });

  it('rend chaque définition jouable dès le niveau 1', () => {
    for (const definition of stack.definitions) {
      const analysis = analyzeDefinition(definition.text);
      const games = availableGames(analysis, 1);
      expect(games.length, `aucun jeu pour ${definition.id}`).toBeGreaterThan(0);
    }
  });

  it('produit un exercice réel pour chaque jeu débloqué de chaque définition', () => {
    for (const definition of stack.definitions) {
      const analysis = analyzeDefinition(definition.text);
      for (const level of [1, 5, 10, 15, 20]) {
        for (const game of availableGames(analysis, level)) {
          const exercise = generateExercise(definition, { kind: game.id, level });
          expect(exercise, `${definition.id} · ${game.id} · niveau ${level}`).not.toBeNull();
        }
      }
    }
  });

  it('débloque l’essentiel du registre au niveau maximal', () => {
    for (const definition of stack.definitions) {
      const analysis = analyzeDefinition(definition.text);
      const games = availableGames(analysis, 20);
      expect(games.length, definition.id).toBeGreaterThanOrEqual(GAME_REGISTRY.length - 2);
    }
  });
});

describe('mode entretien et lecture de code', () => {
  const interviewQuestions = stack.questions.filter((q) => q.tags.includes(INTERVIEW_TAG));

  it('fournit des questions ouvertes couvrant tout le parcours', () => {
    expect(interviewQuestions.length).toBeGreaterThanOrEqual(15);
    const topics = interviewQuestions.map((q) => q.topic.toLowerCase()).join(' ');
    for (const expected of ['jvm', 'spring', 'kafka', 'kubernetes', 'performance', 'architecture']) {
      expect(topics, `sujet manquant : ${expected}`).toContain(expected);
    }
  });

  it('donne à chaque question d’entretien une réponse courte et des relances', () => {
    for (const question of interviewQuestions) {
      expect(question.type, question.id).toBe('free_text');
      expect(question.shortAnswer, question.id).toBeDefined();
      expect(question.shortAnswer!.length, question.id).toBeGreaterThan(60);
      expect(question.answer.length, question.id).toBeGreaterThan(question.shortAnswer!.length);
      expect((question.followUps ?? []).length, question.id).toBeGreaterThan(0);
    }
  });

  it('alimente le jeu de lecture de code', () => {
    const codeQuestions = stack.questions.filter(
      (q) => (q.type === 'code_output' || q.type === 'find_bug') && q.code !== undefined,
    );
    expect(codeQuestions.length).toBeGreaterThan(0);
    for (const question of codeQuestions) {
      expect(question.options, question.id).toBeDefined();
      expect(question.options!.length, question.id).toBeGreaterThan(1);
    }
  });
});
