import { describe, expect, it } from 'vitest';
import { buildDomain } from '@/data/seed/builders';
import { javaDomain } from '@/data/seed/java';
import { analyzeDefinition } from '@/services/textAnalysis';
import { GAME_REGISTRY, availableGames, generateExercise } from '@/services/memorizationEngine';
import { INTERVIEW_TAG } from '@/features/games/InterviewScreen';

const built = buildDomain(javaDomain, 0, '2026-01-01T00:00:00.000Z');
const lessonIds = new Set(built.lessons.map((l) => l.id));
const questionIds = new Set(built.questions.map((q) => q.id));
const definitionIds = new Set(built.definitions.map((d) => d.id));

/**
 * Le parcours est du contenu, donc il n'est pas typé au-delà de sa forme : un
 * identifiant de prérequis mal orthographié compilerait sans broncher et
 * casserait silencieusement l'affichage. Ces tests tiennent lieu de compilateur
 * pour les liens entre leçons, quiz et définitions.
 */
describe('structure du parcours Java', () => {
  it('couvre les cinq étapes, dans l’ordre', () => {
    expect(built.courses.map((c) => c.id)).toEqual([
      'java-c1-debutant',
      'java-c2-objet',
      'java-c3-moderne',
      'java-c4-api',
      'java-c5-performance',
    ]);
    expect(built.courses.map((c) => c.order)).toEqual([0, 1, 2, 3, 4]);
  });

  it('déclare les 40 chapitres numérotés dans l’ordre', () => {
    expect(built.chapters).toHaveLength(40);
    const numbers = built.chapters.map((c) => Number(c.title.split('.')[0]));
    expect(numbers).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it('n’utilise que des identifiants uniques', () => {
    expect(new Set(built.lessons.map((l) => l.id)).size).toBe(built.lessons.length);
    expect(new Set(built.chapters.map((c) => c.id)).size).toBe(built.chapters.length);
    expect(new Set(built.questions.map((q) => q.id)).size).toBe(built.questions.length);
    expect(new Set(built.definitions.map((d) => d.id)).size).toBe(built.definitions.length);
  });

  it('rattache chaque chapitre à un cours existant', () => {
    const courseIds = new Set(built.courses.map((c) => c.id));
    for (const chapter of built.chapters) {
      expect(courseIds.has(chapter.courseId)).toBe(true);
    }
  });

  it('numérote les leçons sans repartir de zéro à chaque chapitre', () => {
    for (const course of built.courses) {
      const orders = built.lessons.filter((l) => l.courseId === course.id).map((l) => l.order);
      expect(orders, course.id).toEqual(Array.from({ length: orders.length }, (_, i) => i));
    }
  });

  it('donne à chaque leçon un titre, un résumé et une durée', () => {
    for (const lesson of built.lessons) {
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.summary.length).toBeGreaterThan(0);
      expect(lesson.estimatedMinutes).toBeGreaterThan(0);
      expect(lesson.blocks.length).toBeGreaterThan(0);
    }
  });
});

describe('graphe des prérequis', () => {
  it('ne pointe que vers des leçons existantes', () => {
    for (const lesson of built.lessons) {
      for (const required of lesson.prerequisites ?? []) {
        expect(lessonIds.has(required), `${lesson.id} exige ${required}`).toBe(true);
      }
    }
  });

  it('ne fait jamais dépendre une leçon d’une leçon postérieure', () => {
    const position = new Map(built.lessons.map((lesson, index) => [lesson.id, index]));
    for (const lesson of built.lessons) {
      for (const required of lesson.prerequisites ?? []) {
        expect(
          position.get(required)!,
          `${lesson.id} exige ${required}, qui vient plus tard dans le parcours`,
        ).toBeLessThan(position.get(lesson.id)!);
      }
    }
  });

  it('ne contient aucun cycle', () => {
    const byId = new Map(built.lessons.map((l) => [l.id, l]));
    const state = new Map<string, 'visiting' | 'done'>();

    const visit = (id: string, trail: string[]): void => {
      if (state.get(id) === 'done') return;
      expect(state.get(id), `cycle : ${[...trail, id].join(' -> ')}`).not.toBe('visiting');
      state.set(id, 'visiting');
      for (const required of byId.get(id)?.prerequisites ?? []) {
        visit(required, [...trail, id]);
      }
      state.set(id, 'done');
    };

    for (const lesson of built.lessons) visit(lesson.id, []);
  });

  it('ancre la toute première leçon sans prérequis', () => {
    expect(built.lessons[0].id).toBe('java-l-introduction');
    expect(built.lessons[0].prerequisites ?? []).toEqual([]);
  });
});

describe('quiz et définitions référencés par les leçons', () => {
  it('ne cite que des questions qui existent', () => {
    for (const lesson of built.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind !== 'quiz') continue;
        expect(questionIds.has(block.questionId), `${lesson.id} cite ${block.questionId}`).toBe(true);
      }
    }
  });

  it('ne cite que des définitions qui existent', () => {
    for (const lesson of built.lessons) {
      for (const block of lesson.blocks) {
        if (block.kind !== 'memorize') continue;
        expect(definitionIds.has(block.definitionId), `${lesson.id} cite ${block.definitionId}`).toBe(true);
      }
    }
  });

  it('rattache chaque question à une leçon existante', () => {
    for (const question of built.questions) {
      expect(question.lessonId).toBeDefined();
      expect(lessonIds.has(question.lessonId!), `${question.id} pointe vers ${question.lessonId}`).toBe(true);
    }
  });

  it('donne à chaque question une explication', () => {
    for (const question of built.questions) {
      expect(question.explanation.length, question.id).toBeGreaterThan(20);
    }
  });

  it('place la bonne réponse parmi les options des QCM', () => {
    for (const question of built.questions) {
      if (!question.options) continue;
      expect(question.options, question.id).toContain(question.answer);
    }
  });
});

describe('mémorisation automatique', () => {
  it('rattache chaque définition à sa leçon', () => {
    for (const definition of built.definitions) {
      expect(lessonIds.has(definition.lessonId!), definition.id).toBe(true);
    }
  });

  it('rend toutes les définitions jouables dès le niveau 1', () => {
    for (const definition of built.definitions) {
      const games = availableGames(analyzeDefinition(definition.text), 1);
      expect(games.length, `${definition.id} ne propose aucun jeu`).toBeGreaterThan(0);
    }
  });

  it('génère un exercice réel pour chaque jeu débloqué, sur chaque définition', () => {
    for (const definition of built.definitions) {
      const analysis = analyzeDefinition(definition.text);
      for (const game of availableGames(analysis, 20)) {
        const exercise = generateExercise(definition, { kind: game.id, level: 10 });
        expect(exercise, `${definition.id} / ${game.id}`).not.toBeNull();
        expect(exercise!.targetKeys.length).toBeGreaterThan(0);
      }
    }
  });

  it('propose au niveau maximum la quasi-totalité du registre, sans code propre à Java', () => {
    const definition = built.definitions.find((d) => d.id === 'java-d-polymorphisme')!;
    const games = availableGames(analyzeDefinition(definition.text), 20);
    expect(games.length).toBeGreaterThanOrEqual(GAME_REGISTRY.length - 2);
  });
});

describe('mode entretien', () => {
  const interview = built.questions.filter((q) => q.tags.includes(INTERVIEW_TAG));

  it('fournit un jeu de questions ouvertes', () => {
    expect(interview.length).toBeGreaterThanOrEqual(20);
    for (const question of interview) {
      expect(question.type).toBe('free_text');
      expect(question.answer.length).toBeGreaterThan(80);
    }
  });

  it('couvre le langage, la POO, les collections et les API', () => {
    const topics = new Set(interview.map((q) => q.topic));
    for (const expected of ['Java', 'classe', 'polymorphisme', 'collections', 'REST', 'DTO']) {
      expect(topics.has(expected), `sujet manquant : ${expected}`).toBe(true);
    }
  });
});
