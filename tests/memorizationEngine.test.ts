import { describe, expect, it } from 'vitest';
import {
  GAME_REGISTRY,
  MAX_LEVEL,
  availableGames,
  difficultyProfile,
  generateExercise,
  generateSession,
  gradeExercise,
  pickWeighted,
  seededRng,
} from '@/services/memorizationEngine';
import { analyzeDefinition } from '@/services/textAnalysis';
import type { Definition, FillBlankShape } from '@/models';

const makeDefinition = (title: string, text: string): Definition => ({
  id: `def-${title}`,
  title,
  text,
  tags: [],
  createdAt: '',
  updatedAt: '',
});

const JAVA = makeDefinition(
  'Java',
  'Java est un langage de programmation orienté objet. Il a été conçu pour être portable grâce à la JVM.',
);
const DOCKER = makeDefinition(
  'Docker',
  'Docker isole une application et ses dépendances dans un conteneur léger. Cela garantit un comportement identique sur toutes les machines.',
);
const ANGLAIS = makeDefinition(
  'Present perfect',
  "Le present perfect relie un fait passé au présent. On l'emploie avec for et since.",
);

const ALL_KINDS = GAME_REGISTRY.map((game) => game.id);

describe('profil de difficulté', () => {
  it('masque de plus en plus à mesure que le niveau monte', () => {
    expect(difficultyProfile(1).blankRatio).toBeLessThan(difficultyProfile(10).blankRatio);
    expect(difficultyProfile(10).blankRatio).toBeLessThan(difficultyProfile(20).blankRatio);
  });

  it('suit la progression demandée : mots, puis groupes, puis morceaux de phrase', () => {
    expect(difficultyProfile(1).unit).toBe('word');
    expect(difficultyProfile(5).unit).toBe('word');
    expect(difficultyProfile(10).unit).toBe('group');
    expect(difficultyProfile(15).unit).toBe('clause');
    expect(difficultyProfile(20).unit).toBe('clause');
  });

  it('ne propose plus de choix passé les premiers niveaux', () => {
    expect(difficultyProfile(1).offerChoices).toBe(true);
    expect(difficultyProfile(12).offerChoices).toBe(false);
  });

  it('borne le niveau des deux côtés', () => {
    expect(difficultyProfile(-5).level).toBe(1);
    expect(difficultyProfile(999).level).toBe(MAX_LEVEL);
  });
});

describe('généricité : aucun contenu codé en dur', () => {
  it.each([JAVA, DOCKER, ANGLAIS])('génère tous les jeux pour « $title »', (definition) => {
    const analysis = analyzeDefinition(definition.text);
    const playable = availableGames(analysis, MAX_LEVEL);
    expect(playable.length).toBeGreaterThanOrEqual(GAME_REGISTRY.length - 1);

    for (const game of playable) {
      const exercise = generateExercise(definition, {
        kind: game.id,
        level: 8,
        rng: seededRng(42),
      });
      expect(exercise, `le jeu ${game.id} ne produit rien`).not.toBeNull();
      expect(exercise!.definitionId).toBe(definition.id);
      expect(exercise!.sourceSentence.length).toBeGreaterThan(0);
    }
  });

  it('n’invente jamais un mot absent de la définition', () => {
    for (const definition of [JAVA, DOCKER, ANGLAIS]) {
      const source = definition.text.toLowerCase();
      for (const kind of ALL_KINDS) {
        const exercise = generateExercise(definition, { kind, level: 6, rng: seededRng(7) });
        if (!exercise || exercise.body.shape !== 'fillBlank') continue;
        for (const blank of exercise.body.blanks) {
          expect(source).toContain(blank.answer.toLowerCase());
          for (const option of blank.options ?? []) {
            expect(source).toContain(option.toLowerCase());
          }
        }
      }
    }
  });

  it('reconstitue exactement la phrase d’origine à partir des morceaux à trous', () => {
    const exercise = generateExercise(DOCKER, { kind: 'fill_progressive', level: 4, rng: seededRng(3) })!;
    const body = exercise.body as FillBlankShape;
    const rebuilt = body.parts
      .map((part) => ('text' in part ? part.text : body.blanks.find((b) => b.id === part.blankId)!.answer))
      .join('');
    expect(rebuilt).toBe(exercise.sourceSentence);
  });

  it('propose toujours la bonne réponse parmi les choix', () => {
    const exercise = generateExercise(JAVA, { kind: 'word_choice', level: 2, rng: seededRng(11) })!;
    const body = exercise.body as FillBlankShape;
    for (const blank of body.blanks) {
      expect(blank.options).toBeDefined();
      expect(blank.options).toContain(blank.answer);
    }
  });

  it('ne met pas de doublon parmi les choix', () => {
    for (let seed = 1; seed <= 20; seed += 1) {
      const exercise = generateExercise(DOCKER, { kind: 'word_choice', level: 3, rng: seededRng(seed) });
      const body = exercise?.body as FillBlankShape | undefined;
      for (const blank of body?.blanks ?? []) {
        const options = blank.options ?? [];
        expect(new Set(options.map((o) => o.toLowerCase())).size).toBe(options.length);
      }
    }
  });
});

describe('variation des trous', () => {
  it('ne masque pas toujours les mêmes mots d’une session à l’autre', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 30; seed += 1) {
      const exercise = generateExercise(DOCKER, { kind: 'fill_progressive', level: 3, rng: seededRng(seed) });
      if (exercise) seen.add(exercise.targetKeys.join('|'));
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it('reste reproductible à graine identique', () => {
    const a = generateExercise(JAVA, { kind: 'fill_progressive', level: 5, rng: seededRng(99) });
    const b = generateExercise(JAVA, { kind: 'fill_progressive', level: 5, rng: seededRng(99) });
    expect(a?.targetKeys).toEqual(b?.targetKeys);
  });
});

describe('apprentissage des erreurs', () => {
  it('cible davantage un mot souvent raté', () => {
    const weakKey = 'conteneur';
    const weakness = (key: string) => (key === weakKey ? 1 : 0);

    const countWith = (lookup: typeof weakness | undefined) => {
      let hits = 0;
      for (let seed = 1; seed <= 60; seed += 1) {
        const exercise = generateExercise(DOCKER, {
          kind: 'fill_progressive',
          level: 2,
          rng: seededRng(seed),
          weakness: lookup,
        });
        if (exercise?.targetKeys.includes(weakKey)) hits += 1;
      }
      return hits;
    };

    expect(countWith(weakness)).toBeGreaterThan(countWith(undefined));
  });

  it('pondère le tirage sans jamais exclure les autres candidats', () => {
    const rng = seededRng(5);
    const picks = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      picks.add(pickWeighted(['a', 'b', 'c'], 1, (item) => (item === 'a' ? 100 : 1), rng)[0]);
    }
    expect(picks.has('a')).toBe(true);
    expect(picks.size).toBeGreaterThan(1);
  });
});

describe('génération de session', () => {
  it('varie les types de jeux', () => {
    const session = generateSession(DOCKER, { count: 8, level: 10, rng: seededRng(21) });
    expect(session).toHaveLength(8);
    expect(new Set(session.map((exercise) => exercise.kind)).size).toBeGreaterThan(2);
  });

  it('respecte une liste de jeux imposée', () => {
    const session = generateSession(JAVA, {
      count: 4,
      level: 5,
      kinds: ['true_false'],
      rng: seededRng(4),
    });
    expect(session.every((exercise) => exercise.kind === 'true_false')).toBe(true);
  });

  it('ne renvoie rien pour une définition trop courte', () => {
    const tiny = makeDefinition('X', 'Oui.');
    expect(generateSession(tiny, { count: 3, level: 1, rng: seededRng(1) })).toEqual([]);
  });
});

describe('correction', () => {
  it('corrige un texte à trous en ignorant casse et accents', () => {
    const exercise = generateExercise(JAVA, { kind: 'fill_progressive', level: 1, rng: seededRng(8) })!;
    const body = exercise.body as FillBlankShape;
    const answers = Object.fromEntries(
      body.blanks.map((blank) => [blank.id, blank.answer.toUpperCase()]),
    );
    expect(gradeExercise(exercise, answers).correct).toBe(true);

    const wrong = Object.fromEntries(body.blanks.map((blank) => [blank.id, 'nimporte quoi']));
    expect(gradeExercise(exercise, wrong).correct).toBe(false);
  });

  it('corrige une remise en ordre', () => {
    const exercise = generateExercise(DOCKER, { kind: 'reorder_words', level: 1, rng: seededRng(6) })!;
    const body = exercise.body as { correctOrder: string[] };
    expect(gradeExercise(exercise, body.correctOrder).correct).toBe(true);
    expect(gradeExercise(exercise, [...body.correctOrder].reverse()).correct).toBe(false);
  });

  it('corrige un vrai/faux', () => {
    for (let seed = 1; seed <= 10; seed += 1) {
      const exercise = generateExercise(DOCKER, { kind: 'true_false', level: 4, rng: seededRng(seed) })!;
      const body = exercise.body as { isTrue: boolean };
      expect(gradeExercise(exercise, body.isTrue).correct).toBe(true);
      expect(gradeExercise(exercise, !body.isTrue).correct).toBe(false);
    }
  });

  it('corrige la désignation de l’intrus', () => {
    const exercise = generateExercise(DOCKER, { kind: 'find_error', level: 5, rng: seededRng(2) })!;
    const body = exercise.body as { wrongIndex: number };
    expect(gradeExercise(exercise, body.wrongIndex).correct).toBe(true);
    expect(gradeExercise(exercise, body.wrongIndex + 1).correct).toBe(false);
  });

  it('accepte une restitution proche mais pas approximative', () => {
    const exercise = generateExercise(DOCKER, { kind: 'continue_sentence', level: 4, rng: seededRng(9) })!;
    const body = exercise.body as { answer: string };
    expect(gradeExercise(exercise, body.answer).correct).toBe(true);
    expect(gradeExercise(exercise, 'aucun rapport du tout').correct).toBe(false);
  });
});

describe('registre ouvert', () => {
  it('donne des identifiants uniques', () => {
    expect(new Set(ALL_KINDS).size).toBe(ALL_KINDS.length);
  });

  it('inclut le mot manquant chronométré', () => {
    expect(ALL_KINDS).toContain('timed_missing_word');
  });

  it('applique la limite de temps quand elle est demandée', () => {
    const exercise = generateExercise(JAVA, {
      kind: 'timed_missing_word',
      level: 1,
      rng: seededRng(1),
      timeLimitMs: 5000,
    });
    expect(exercise?.timeLimitMs).toBe(5000);
  });

  it('filtre les jeux trop exigeants pour une définition courte', () => {
    const analysis = analyzeDefinition('Docker isole une application.');
    const games = availableGames(analysis, 1).map((game) => game.id);
    expect(games).toContain('fill_progressive');
    expect(games).not.toContain('full_reconstruction');
  });
});
