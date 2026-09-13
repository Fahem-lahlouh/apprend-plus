import type {
  Definition,
  ExerciseShape,
  FillBlankPart,
  FillBlankSlot,
  MemoExercise,
  MemoGameKind,
} from '@/models';
import {
  analyzeDefinition,
  normalizeKey,
  recallSimilarity,
  splitIntoChunks,
  type DefinitionAnalysis,
  type Phrase,
  type Sentence,
  type Token,
} from './textAnalysis';
import type { IconName } from '@/design-system/Icon';

/**
 * MemorizationEngine
 * ------------------
 * Reçoit une définition, rend des exercices. Rien d'autre.
 *
 * Trois règles d'architecture, dans l'ordre d'importance :
 *
 * 1. Aucun contenu n'est codé en dur. Chaque exercice est dérivé du texte de la
 *    définition, donc Java, Docker ou le present perfect passent par le même code.
 * 2. Rien n'est pré-généré ni stocké. `generateExercise` est appelé au moment de
 *    jouer, sur l'analyse recalculée. Ajouter un jeu = ajouter une entrée dans
 *    GAME_REGISTRY ; les définitions déjà enregistrées le proposent aussitôt,
 *    sans migration.
 * 3. Tout est pur et injectable (`rng`, `weakness`), donc testable sans navigateur.
 */

export type Rng = () => number;

/**
 * Générateur déterministe, utilisé par les tests et le rejeu d'une session.
 *
 * La graine passe d'abord par un brassage (splitmix32) : un xorshift démarré
 * brut sur 1, 2, 3… sort des premières valeurs très proches, ce qui ferait
 * tomber les trous toujours au même endroit.
 */
export function seededRng(seed: number): Rng {
  let state = (seed >>> 0) + 0x9e3779b9;
  state = Math.imul(state ^ (state >>> 16), 0x21f0aaad);
  state = Math.imul(state ^ (state >>> 15), 0x735a2d97);
  state = (state ^ (state >>> 15)) >>> 0 || 1;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0x100000000;
  };
}

/** Taux d'erreur passé sur un mot ou une expression, entre 0 et 1. */
export type WeaknessLookup = (key: string) => number;

export const NO_WEAKNESS: WeaknessLookup = () => 0;

/* --------------------------- Registre des jeux -------------------------- */

export interface GameDefinition {
  id: MemoGameKind;
  label: string;
  description: string;
  icon: IconName;
  /** Niveau minimum de la définition avant de proposer ce jeu. */
  minLevel: number;
  /** Nombre de mots minimum dans la définition pour que le jeu ait du sens. */
  minWords: number;
  /** Nombre de phrases minimum. */
  minSentences: number;
  generate: (context: GenerationContext) => ExerciseDraft | null;
}

export interface GenerationContext {
  definition: Definition;
  analysis: DefinitionAnalysis;
  level: number;
  profile: DifficultyProfile;
  rng: Rng;
  weakness: WeaknessLookup;
}

interface ExerciseDraft {
  instruction: string;
  prompt: string;
  body: ExerciseShape;
  targetKeys: string[];
  sourceSentence: string;
}

/* ------------------------------ Difficulté ------------------------------ */

export interface DifficultyProfile {
  level: number;
  /** Part des mots porteurs de sens à masquer, de 0 à 1. */
  blankRatio: number;
  /** Nombre maximum de trous dans un exercice. */
  maxBlanks: number;
  /** Granularité du masquage. */
  unit: 'word' | 'group' | 'clause';
  /** Des propositions sont-elles offertes ? */
  offerChoices: boolean;
  /** Nombre de propositions quand il y en a. */
  choiceCount: number;
  /** Plus c'est haut, plus les distracteurs ressemblent à la bonne réponse. */
  distractorCloseness: number;
}

export const MAX_LEVEL = 20;

/**
 * Profil de difficulté pour un niveau de 1 à 20. La progression suit
 * exactement la courbe demandée : quelques mots au début, des groupes vers 10,
 * des morceaux de phrase vers 15, une reconstruction quasi complète à 20.
 */
export function difficultyProfile(level: number): DifficultyProfile {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, Math.round(level)));
  const ratio = Math.min(0.9, 0.08 + (clamped - 1) * 0.045);
  return {
    level: clamped,
    blankRatio: Number(ratio.toFixed(3)),
    maxBlanks: clamped <= 3 ? 1 : Math.min(6, 1 + Math.floor(clamped / 3)),
    unit: clamped <= 8 ? 'word' : clamped <= 14 ? 'group' : 'clause',
    offerChoices: clamped <= 6,
    choiceCount: clamped <= 3 ? 3 : 4,
    distractorCloseness: Math.min(1, clamped / MAX_LEVEL),
  };
}

/* ------------------------------- Utilitaires ---------------------------- */

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Tirage pondéré : l'importance du mot fixe la base, le taux d'erreur passé la
 * multiplie. Un mot souvent raté revient donc bien plus souvent, sans jamais
 * devenir le seul possible — les trous doivent continuer de varier d'une
 * session à l'autre pour ne pas mémoriser leur position.
 */
export function pickWeighted<T>(
  items: readonly T[],
  count: number,
  weightOf: (item: T) => number,
  rng: Rng,
): T[] {
  const pool = items.map((item) => ({ item, weight: Math.max(0.01, weightOf(item)) }));
  const chosen: T[] = [];
  for (let n = 0; n < count && pool.length > 0; n += 1) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let threshold = rng() * total;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i += 1) {
      threshold -= pool[i].weight;
      if (threshold <= 0) {
        index = i;
        break;
      }
    }
    chosen.push(pool[index].item);
    pool.splice(index, 1);
  }
  return chosen;
}

function tokenWeight(token: Token, weakness: WeaknessLookup): number {
  return token.importance * (1 + 2 * weakness(token.key));
}

/**
 * Choisit une phrase parmi celles qui sont assez longues pour le jeu demandé.
 *
 * `minTokens` est indispensable : une définition peut compter assez de mots au
 * total pour qu'un jeu soit proposé, alors que la phrase tirée au sort, elle,
 * est trop courte. Filtrer ici plutôt que d'abandonner ensuite évite qu'un jeu
 * annoncé comme disponible ne produise aucun exercice.
 */
function chooseSentence(
  analysis: DefinitionAnalysis,
  rng: Rng,
  weakness: WeaknessLookup,
  minTokens = 3,
): Sentence | null {
  const usable = analysis.sentences.filter((sentence) => sentence.tokens.length >= minTokens);
  if (usable.length === 0) return null;
  return pickWeighted(
    usable,
    1,
    (sentence) =>
      1 + sentence.tokens.reduce((sum, token) => sum + weakness(token.key), 0),
    rng,
  )[0];
}

/**
 * Distracteurs pris dans la définition elle-même puis dans une réserve neutre :
 * ils restent donc toujours crédibles, quel que soit le sujet.
 */
function buildOptions(
  answer: string,
  analysis: DefinitionAnalysis,
  profile: DifficultyProfile,
  rng: Rng,
): string[] {
  const answerKey = normalizeKey(answer);
  const answerWords = answer.trim().split(/\s+/).length;

  // Un trou d'un seul mot appelle des distracteurs d'un seul mot, un trou
  // d'expression appelle des expressions : la forme ne doit jamais trahir la
  // bonne réponse.
  const pool =
    answerWords === 1
      ? analysis.importantTokens
          .filter((token) => normalizeKey(token.text) !== answerKey)
          .map((token) => token.text)
      : analysis.importantPhrases
          .filter((phrase) => phrase.key !== answerKey)
          .map((phrase) => phrase.text);

  // À haute difficulté on privilégie les candidats de longueur proche.
  const ranked =
    profile.distractorCloseness > 0.5
      ? [...pool].sort(
          (a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length),
        )
      : shuffle(pool, rng);

  const distractors: string[] = [];
  const seen = new Set([answerKey]);
  for (const candidate of ranked) {
    const key = normalizeKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length >= profile.choiceCount - 1) break;
  }

  return shuffle([answer, ...distractors], rng);
}

/** Cibles à masquer dans une phrase, à la granularité voulue par le niveau. */
function selectTargets(
  sentence: Sentence,
  analysis: DefinitionAnalysis,
  profile: DifficultyProfile,
  rng: Rng,
  weakness: WeaknessLookup,
): { text: string; key: string; start: number; end: number }[] {
  if (profile.unit === 'word') {
    const candidates = sentence.tokens.filter((token) => token.importance > 0);
    if (candidates.length === 0) return [];
    const count = Math.max(
      1,
      Math.min(profile.maxBlanks, Math.round(candidates.length * profile.blankRatio)),
    );
    return pickWeighted(candidates, count, (token) => tokenWeight(token, weakness), rng)
      .map((token) => ({ text: token.text, key: token.key, start: token.start, end: token.end }))
      .sort((a, b) => a.start - b.start);
  }

  const phrases = analysis.importantPhrases.filter((phrase) => phrase.sentenceIndex === sentence.index);
  if (phrases.length === 0) {
    return selectTargets(sentence, analysis, { ...profile, unit: 'word' }, rng, weakness);
  }

  if (profile.unit === 'group') {
    const count = Math.max(1, Math.min(profile.maxBlanks, Math.ceil(phrases.length * profile.blankRatio)));
    return pickWeighted(phrases, count, (phrase) => phrase.importance * (1 + 2 * weakness(phrase.key)), rng)
      .map((phrase) => toSpan(sentence, phrase))
      .sort((a, b) => a.start - b.start);
  }

  // 'clause' : on masque un morceau de phrase entier autour de l'expression clé.
  const anchor = pickWeighted(
    phrases,
    1,
    (phrase) => phrase.importance * (1 + 2 * weakness(phrase.key)),
    rng,
  )[0];
  const tokens = sentence.tokens;
  const from = tokens.find((token) => token.index === anchor.startToken) ?? tokens[0];
  const lastIndex = Math.min(tokens.length - 1, anchor.endToken + 2);
  const to = tokens[lastIndex] ?? tokens[tokens.length - 1];
  const text = sentence.text.slice(from.start, to.end);
  return [{ text, key: normalizeKey(text), start: from.start, end: to.end }];
}

function toSpan(sentence: Sentence, phrase: Phrase) {
  const tokens = sentence.tokens;
  const from = tokens.find((token) => token.index === phrase.startToken);
  const to = tokens.find((token) => token.index === phrase.endToken);
  if (!from || !to) return { text: phrase.text, key: phrase.key, start: 0, end: phrase.text.length };
  return { text: sentence.text.slice(from.start, to.end), key: phrase.key, start: from.start, end: to.end };
}

/** Construit la phrase à trous à partir des zones masquées. */
function buildFillBlank(
  sentence: Sentence,
  targets: { text: string; key: string; start: number; end: number }[],
  analysis: DefinitionAnalysis,
  profile: DifficultyProfile,
  rng: Rng,
): { parts: FillBlankPart[]; blanks: FillBlankSlot[] } {
  const parts: FillBlankPart[] = [];
  const blanks: FillBlankSlot[] = [];
  let cursor = 0;

  targets.forEach((target, index) => {
    if (target.start > cursor) parts.push({ text: sentence.text.slice(cursor, target.start) });
    const id = `b${index}`;
    parts.push({ blankId: id });
    blanks.push({
      id,
      answer: target.text,
      options: profile.offerChoices ? buildOptions(target.text, analysis, profile, rng) : undefined,
    });
    cursor = target.end;
  });

  if (cursor < sentence.text.length) parts.push({ text: sentence.text.slice(cursor) });
  return { parts, blanks };
}

/* ------------------------------ Générateurs ----------------------------- */

function generateFillBlank(context: GenerationContext, instruction: string): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  const targets = selectTargets(sentence, context.analysis, context.profile, context.rng, context.weakness);
  if (targets.length === 0) return null;
  const { parts, blanks } = buildFillBlank(sentence, targets, context.analysis, context.profile, context.rng);
  return {
    instruction,
    prompt: '',
    body: { shape: 'fillBlank', parts, blanks },
    targetKeys: targets.map((target) => target.key),
    sourceSentence: sentence.text,
  };
}

function generateReorderWords(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness, 4);
  if (!sentence) return null;
  const words = sentence.tokens.map((token) => token.text);
  return {
    instruction: 'Remets les mots dans le bon ordre.',
    prompt: '',
    body: { shape: 'reorder', items: shuffle(words, context.rng), correctOrder: words, unit: 'word' },
    targetKeys: sentence.tokens.filter((token) => token.importance > 0).map((token) => token.key),
    sourceSentence: sentence.text,
  };
}

function generateReorderChunks(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness, 6);
  if (!sentence) return null;
  const chunks = splitIntoChunks(sentence, 2 + Math.floor(context.profile.level / 5));
  if (chunks.length < 2) return null;
  return {
    instruction: 'Remets les morceaux de phrase dans le bon ordre.',
    prompt: '',
    body: { shape: 'reorder', items: shuffle(chunks, context.rng), correctOrder: chunks, unit: 'chunk' },
    targetKeys: [normalizeKey(sentence.text)],
    sourceSentence: sentence.text,
  };
}

function generateContinueSentence(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness, 5);
  if (!sentence) return null;
  const cutIndex = Math.max(2, Math.floor(sentence.tokens.length * 0.45));
  const cut = sentence.tokens[cutIndex];
  const start = sentence.text.slice(0, cut.start).trim();
  const rest = sentence.text.slice(cut.start).trim();
  if (start.length === 0 || rest.length === 0) return null;
  return {
    instruction: 'Continue la phrase.',
    prompt: `${start} …`,
    body: { shape: 'recall', answer: rest, autoGrade: true },
    targetKeys: sentence.tokens.slice(cutIndex).filter((t) => t.importance > 0).map((t) => t.key),
    sourceSentence: sentence.text,
  };
}

function generateHiddenSentence(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  const position = sentence.index + 1;
  return {
    instruction: 'Restitue la phrase de mémoire.',
    prompt: `Phrase ${position} sur ${context.analysis.sentences.length} de « ${context.definition.title} »`,
    body: { shape: 'recall', answer: sentence.text, autoGrade: false },
    targetKeys: sentence.tokens.filter((token) => token.importance > 0).map((token) => token.key),
    sourceSentence: sentence.text,
  };
}

function generateTriggerWord(context: GenerationContext): ExerciseDraft | null {
  const candidates = context.analysis.importantTokens.slice(0, 12);
  if (candidates.length === 0) return null;
  const token = pickWeighted(candidates, 1, (t) => tokenWeight(t, context.weakness), context.rng)[0];
  const sentence = context.analysis.sentences.find((s) => s.tokens.some((t) => t.key === token.key));
  if (!sentence) return null;
  return {
    instruction: 'Ce mot déclencheur appartient à une phrase : retrouve-la.',
    prompt: token.text,
    body: { shape: 'recall', answer: sentence.text, autoGrade: false },
    targetKeys: [token.key],
    sourceSentence: sentence.text,
  };
}

function generateQuestionAnswer(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  const candidates = sentence.tokens.filter((token) => token.importance > 0);
  if (candidates.length === 0) return null;
  const target = pickWeighted(candidates, 1, (t) => tokenWeight(t, context.weakness), context.rng)[0];
  const masked = `${sentence.text.slice(0, target.start)}…${sentence.text.slice(target.end)}`;
  return {
    instruction: `Quel mot manque dans cette phrase de « ${context.definition.title} » ?`,
    prompt: masked,
    body: { shape: 'recall', answer: target.text, autoGrade: true },
    targetKeys: [target.key],
    sourceSentence: sentence.text,
  };
}

function generateTrueFalse(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  const shouldBeTrue = context.rng() < 0.5;
  if (shouldBeTrue) {
    return {
      instruction: 'Cette phrase est-elle exacte ?',
      prompt: '',
      body: { shape: 'trueFalse', statement: sentence.text, isTrue: true },
      targetKeys: sentence.tokens.filter((t) => t.importance > 0).map((t) => t.key),
      sourceSentence: sentence.text,
    };
  }

  const altered = alterSentence(sentence, context);
  if (!altered) return null;
  return {
    instruction: 'Cette phrase est-elle exacte ?',
    prompt: '',
    body: {
      shape: 'trueFalse',
      statement: altered.text,
      isTrue: false,
      correctedStatement: sentence.text,
    },
    targetKeys: [altered.replacedKey],
    sourceSentence: sentence.text,
  };
}

/** Remplace un mot porteur de sens par un autre mot de la définition. */
function alterSentence(
  sentence: Sentence,
  context: GenerationContext,
): { text: string; replacedKey: string; wrongWord: string; tokenIndex: number } | null {
  const candidates = sentence.tokens.filter((token) => token.importance > 0);
  if (candidates.length === 0) return null;
  const target = pickWeighted(candidates, 1, (t) => tokenWeight(t, context.weakness), context.rng)[0];
  // Le remplaçant ne doit pas déjà figurer dans la phrase, sinon la répétition
  // désigne l'intrus toute seule.
  const present = new Set(sentence.tokens.map((token) => token.key));
  const replacements = context.analysis.importantTokens.filter((token) => !present.has(token.key));
  if (replacements.length === 0) return null;
  const replacement = pick(replacements, context.rng);
  return {
    text: `${sentence.text.slice(0, target.start)}${replacement.text}${sentence.text.slice(target.end)}`,
    replacedKey: target.key,
    wrongWord: replacement.text,
    tokenIndex: target.index,
  };
}

function generateFindError(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness, 4);
  if (!sentence) return null;
  const altered = alterSentence(sentence, context);
  if (!altered) return null;
  const tokens = sentence.tokens.map((token) =>
    token.index === altered.tokenIndex ? altered.wrongWord : token.text,
  );
  const original = sentence.tokens[altered.tokenIndex];
  return {
    instruction: 'Un mot a été remplacé. Touche l’intrus.',
    prompt: '',
    body: {
      shape: 'findError',
      tokens,
      wrongIndex: altered.tokenIndex,
      correctWord: original.text,
    },
    targetKeys: [altered.replacedKey],
    sourceSentence: sentence.text,
  };
}

function generateChoosePhrasing(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  const wrongOne = alterSentence(sentence, context);
  const wrongTwo = alterSentence(sentence, context);
  const options = [sentence.text];
  for (const candidate of [wrongOne, wrongTwo]) {
    if (candidate && !options.includes(candidate.text)) options.push(candidate.text);
  }
  if (options.length < 2) return null;
  const shuffled = shuffle(options, context.rng);
  return {
    instruction: 'Quelle est la formulation exacte ?',
    prompt: '',
    body: { shape: 'choice', options: shuffled, correctIndex: shuffled.indexOf(sentence.text) },
    targetKeys: [wrongOne?.replacedKey ?? normalizeKey(sentence.text)],
    sourceSentence: sentence.text,
  };
}

function generateFullReconstruction(context: GenerationContext): ExerciseDraft | null {
  const { definition, analysis } = context;
  if (analysis.sentences.length === 0) return null;
  return {
    instruction: 'Écris la définition complète, de mémoire.',
    prompt: definition.title,
    body: { shape: 'recall', answer: definition.text.trim(), autoGrade: false },
    targetKeys: analysis.importantTokens.slice(0, 10).map((token) => token.key),
    sourceSentence: definition.text.trim(),
  };
}

function generateDictation(context: GenerationContext): ExerciseDraft | null {
  const sentence = chooseSentence(context.analysis, context.rng, context.weakness);
  if (!sentence) return null;
  return {
    instruction: 'Écoute la phrase, puis écris-la.',
    prompt: sentence.text,
    body: { shape: 'recall', answer: sentence.text, autoGrade: true },
    targetKeys: sentence.tokens.filter((token) => token.importance > 0).map((token) => token.key),
    sourceSentence: sentence.text,
  };
}

/* ------------------------------- Le registre ---------------------------- */

/**
 * La liste officielle des jeux de mémorisation.
 *
 * Ajouter un jeu ici suffit : toutes les définitions déjà enregistrées le
 * proposent immédiatement, puisqu'aucun exercice n'est stocké.
 */
export const GAME_REGISTRY: GameDefinition[] = [
  {
    id: 'fill_progressive',
    label: 'Définition à trous',
    description: 'Des trous de plus en plus larges à mesure que tu progresses.',
    icon: 'note',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: (context) => generateFillBlank(context, 'Complète la phrase.'),
  },
  {
    id: 'word_choice',
    label: 'Choix de mots',
    description: 'Le mot manquant est parmi les propositions.',
    icon: 'cards',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: (context) =>
      generateFillBlank(
        { ...context, profile: { ...context.profile, offerChoices: true } },
        'Choisis le mot qui manque.',
      ),
  },
  {
    id: 'blank_free',
    label: 'Trous sans choix',
    description: 'Le mot manquant est à écrire, sans aide.',
    icon: 'pencil',
    minLevel: 3,
    minWords: 5,
    minSentences: 1,
    generate: (context) =>
      generateFillBlank(
        { ...context, profile: { ...context.profile, offerChoices: false } },
        'Écris le mot qui manque.',
      ),
  },
  {
    id: 'reorder_words',
    label: 'Remettre les mots dans l’ordre',
    description: 'La phrase est mélangée, remets-la d’aplomb.',
    icon: 'rotate',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: generateReorderWords,
  },
  {
    id: 'reorder_chunks',
    label: 'Remettre les morceaux dans l’ordre',
    description: 'Des groupes de mots à replacer.',
    icon: 'rotate',
    minLevel: 4,
    minWords: 6,
    minSentences: 1,
    generate: generateReorderChunks,
  },
  {
    id: 'hidden_sentence',
    label: 'Phrase cachée',
    description: 'Restitue une phrase entière de mémoire.',
    icon: 'lock',
    minLevel: 6,
    minWords: 4,
    minSentences: 1,
    generate: generateHiddenSentence,
  },
  {
    id: 'continue_sentence',
    label: 'Continuer une phrase',
    description: 'Le début est donné, la suite est à toi.',
    icon: 'chevron-right',
    minLevel: 3,
    minWords: 6,
    minSentences: 1,
    generate: generateContinueSentence,
  },
  {
    id: 'trigger_word',
    label: 'Mot déclencheur',
    description: 'Un mot clé, et toute la phrase doit revenir.',
    icon: 'bolt',
    minLevel: 5,
    minWords: 5,
    minSentences: 1,
    generate: generateTriggerWord,
  },
  {
    id: 'question_answer',
    label: 'Question → réponse',
    description: 'Une question générée depuis la définition.',
    icon: 'chat',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: generateQuestionAnswer,
  },
  {
    id: 'true_false',
    label: 'Vrai / Faux',
    description: 'Une phrase exacte, ou subtilement fausse.',
    icon: 'check-circle',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: generateTrueFalse,
  },
  {
    id: 'find_error',
    label: 'Trouver l’erreur',
    description: 'Un mot a été remplacé : repère-le.',
    icon: 'search',
    minLevel: 2,
    minWords: 5,
    minSentences: 1,
    generate: generateFindError,
  },
  {
    id: 'choose_phrasing',
    label: 'Choisir la bonne formulation',
    description: 'Trois versions, une seule est exacte.',
    icon: 'target',
    minLevel: 2,
    minWords: 5,
    minSentences: 1,
    generate: generateChoosePhrasing,
  },
  {
    id: 'full_reconstruction',
    label: 'Reconstruction complète',
    description: 'Toute la définition, sans aucune aide.',
    icon: 'trophy',
    minLevel: 10,
    minWords: 4,
    minSentences: 1,
    generate: generateFullReconstruction,
  },
  {
    id: 'dictation',
    label: 'Dictée',
    description: 'La phrase est lue à voix haute, à toi de l’écrire.',
    icon: 'volume',
    minLevel: 4,
    minWords: 4,
    minSentences: 1,
    generate: generateDictation,
  },
  {
    id: 'timed_missing_word',
    label: 'Mot manquant chronométré',
    description: 'Un mot manque, le chrono tourne.',
    icon: 'clock',
    minLevel: 1,
    minWords: 4,
    minSentences: 1,
    generate: (context) => generateFillBlank(context, 'Complète avant la fin du temps.'),
  },
];

export function getGame(kind: MemoGameKind): GameDefinition | undefined {
  return GAME_REGISTRY.find((game) => game.id === kind);
}

/** Jeux réellement jouables pour une définition et un niveau donnés. */
export function availableGames(analysis: DefinitionAnalysis, level: number): GameDefinition[] {
  return GAME_REGISTRY.filter(
    (game) =>
      analysis.wordCount >= game.minWords &&
      analysis.sentences.length >= game.minSentences &&
      level >= game.minLevel,
  );
}

/* ------------------------------ Point d'entrée -------------------------- */

export interface GenerateOptions {
  kind: MemoGameKind;
  level?: number;
  rng?: Rng;
  weakness?: WeaknessLookup;
  /** Impose une limite de temps (jeux chronométrés). */
  timeLimitMs?: number;
}

/**
 * Génère un exercice pour une définition. C'est la seule fonction dont les
 * écrans ont besoin : `generateExercises(definition)` au sens de l'énoncé.
 */
export function generateExercise(definition: Definition, options: GenerateOptions): MemoExercise | null {
  const analysis = analyzeDefinition(definition.text);
  const game = getGame(options.kind);
  if (!game) return null;

  const level = Math.max(1, Math.min(MAX_LEVEL, options.level ?? 1));
  const rng = options.rng ?? Math.random;
  const context: GenerationContext = {
    definition,
    analysis,
    level,
    profile: difficultyProfile(level),
    rng,
    weakness: options.weakness ?? NO_WEAKNESS,
  };

  const draft = game.generate(context);
  if (!draft) return null;

  return {
    id: `${definition.id}:${game.id}:${Math.floor(rng() * 1e9).toString(36)}`,
    kind: game.id,
    definitionId: definition.id,
    level,
    instruction: draft.instruction,
    prompt: draft.prompt,
    body: draft.body,
    targetKeys: draft.targetKeys,
    sourceSentence: draft.sourceSentence,
    timeLimitMs: options.timeLimitMs,
  };
}

/** Génère une série d'exercices variés, en évitant de répéter le même jeu. */
export function generateSession(
  definition: Definition,
  options: { count: number; level?: number; kinds?: MemoGameKind[]; rng?: Rng; weakness?: WeaknessLookup },
): MemoExercise[] {
  const analysis = analyzeDefinition(definition.text);
  const rng = options.rng ?? Math.random;
  const level = options.level ?? 1;
  const pool = (options.kinds ?? availableGames(analysis, level).map((game) => game.id)).filter((kind) =>
    getGame(kind),
  );
  if (pool.length === 0) return [];

  const exercises: MemoExercise[] = [];
  let order = shuffle(pool, rng);
  for (let i = 0; exercises.length < options.count && i < options.count * 4; i += 1) {
    if (order.length === 0) order = shuffle(pool, rng);
    const kind = order.pop()!;
    const exercise = generateExercise(definition, { kind, level, rng, weakness: options.weakness });
    if (exercise) exercises.push(exercise);
  }
  return exercises;
}

/* ------------------------------- Correction ----------------------------- */

export interface ExerciseGrade {
  correct: boolean;
  /** Entre 0 et 1, pour les restitutions libres. */
  similarity?: number;
  expected: string;
}

/** Correction d'un exercice, quelle que soit sa forme. */
export function gradeExercise(exercise: MemoExercise, answer: unknown): ExerciseGrade {
  const body = exercise.body;
  switch (body.shape) {
    case 'fillBlank': {
      const given = (answer ?? {}) as Record<string, string>;
      const correct = body.blanks.every(
        (blank) => normalizeKey(given[blank.id] ?? '') === normalizeKey(blank.answer),
      );
      return { correct, expected: body.blanks.map((blank) => blank.answer).join(' · ') };
    }
    case 'reorder': {
      const given = (answer ?? []) as string[];
      const correct =
        given.length === body.correctOrder.length &&
        given.every((item, index) => normalizeKey(item) === normalizeKey(body.correctOrder[index]));
      return { correct, expected: body.correctOrder.join(' ') };
    }
    case 'trueFalse':
      return { correct: answer === body.isTrue, expected: body.isTrue ? 'Vrai' : 'Faux' };
    case 'choice':
      return { correct: answer === body.correctIndex, expected: body.options[body.correctIndex] };
    case 'findError':
      return { correct: answer === body.wrongIndex, expected: body.correctWord };
    case 'recall': {
      const given = String(answer ?? '');
      const similarity = recallSimilarity(body.answer, given);
      return { correct: body.autoGrade ? similarity >= 0.7 : similarity >= 0.9, similarity, expected: body.answer };
    }
    default:
      return { correct: false, expected: '' };
  }
}
