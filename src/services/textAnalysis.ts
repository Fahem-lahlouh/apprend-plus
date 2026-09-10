/**
 * Analyse générique d'une définition.
 *
 * Aucune règle spécifique à un domaine : le même code traite « Java est un
 * langage orienté objet », « Docker isole des processus dans des conteneurs »
 * ou « Le present perfect relie le passé au présent ». Tout repose sur la
 * structure du texte (ponctuation, mots vides, rareté, casse), pas sur son sujet.
 *
 * Le résultat n'est jamais persisté : il est recalculé depuis `Definition.text`
 * à chaque partie. C'est ce qui permet d'ajouter un jeu six mois plus tard sans
 * migrer une seule définition existante.
 */

/** Mots vides français et anglais : jamais de bons candidats pour un trou. */
const STOPWORDS = new Set([
  // français
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'au', 'aux', 'et', 'ou', 'où',
  'à', 'a', 'en', 'dans', 'sur', 'sous', 'pour', 'par', 'avec', 'sans', 'que', 'qui', 'quoi',
  'dont', 'est', 'sont', 'était', 'étaient', 'être', 'avoir', 'as', 'ai', 'ont', 'ce', 'cet',
  'cette', 'ces', 'son', 'sa', 'ses', 'leur', 'leurs', 'il', 'elle', 'ils', 'elles', 'on',
  'nous', 'vous', 'je', 'tu', 'se', 'ne', 'pas', 'plus', 'moins', 'très', 'peu', 'aussi',
  'comme', 'mais', 'donc', 'car', 'si', 'y', 'lui', 'leur', 'tout', 'tous', 'toute', 'toutes',
  'même', 'entre', 'vers', 'chez', 'depuis', 'alors', 'ainsi', 'cela', 'ça', 'celui', 'celle',
  'peut', 'peuvent', 'doit', 'doivent', 'fait', 'faire', 'permet', 'permettre',
  // anglais
  'the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'as', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'that', 'this', 'these', 'those', 'it', 'its',
  'and', 'or', 'but', 'not', 'no', 'so', 'if', 'then', 'than', 'there', 'here', 'can', 'will',
  'would', 'should', 'could', 'has', 'have', 'had', 'do', 'does', 'did', 'you', 'we', 'they',
]);

export interface Token {
  /** Texte exact tel qu'il apparaît, casse et accents compris. */
  text: string;
  /** Forme normalisée, utilisée comme clé de suivi et pour les comparaisons. */
  key: string;
  /** Position dans la phrase. */
  index: number;
  /** Décalages dans le texte de la phrase, pour un masquage exact. */
  start: number;
  end: number;
  isStopword: boolean;
  /** Score d'importance : plus il est haut, plus le mot porte du sens. */
  importance: number;
}

export interface Sentence {
  id: string;
  index: number;
  /** Phrase telle quelle, ponctuation finale comprise. */
  text: string;
  tokens: Token[];
}

export interface Phrase {
  /** Expression de 2 à 4 mots, contenue dans une seule phrase. */
  text: string;
  key: string;
  sentenceIndex: number;
  startToken: number;
  endToken: number;
  importance: number;
}

export interface DefinitionAnalysis {
  sentences: Sentence[];
  /** Mots porteurs de sens, du plus important au moins important. */
  importantTokens: Token[];
  /** Expressions porteuses de sens, du plus important au moins important. */
  importantPhrases: Phrase[];
  wordCount: number;
}

export function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}+#.-]/gu, '')
    .replace(/^[.-]+|[.-]+$/g, '');
}

/** Découpe en phrases sur la ponctuation forte, sans casser « M. » ni « 3.5 ». */
export function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];
  const out: string[] = [];
  let current = '';
  for (let i = 0; i < trimmed.length; i += 1) {
    const char = trimmed[i];
    current += char;
    if (char !== '.' && char !== '!' && char !== '?' && char !== '\n') continue;
    const next = trimmed[i + 1];
    // Un point entouré de chiffres ou suivi d'une minuscule ne termine pas la phrase.
    if (char === '.' && /\d/.test(trimmed[i - 1] ?? '') && /\d/.test(next ?? '')) continue;
    if (next !== undefined && !/[\s\n]/.test(next)) continue;
    const sentence = current.trim();
    if (sentence.length > 0) out.push(sentence);
    current = '';
  }
  const rest = current.trim();
  if (rest.length > 0) out.push(rest);
  return out;
}

// L'apostrophe est un séparateur : « l'emploie » donne « l » (mot vide) et
// « emploie », sinon l'élision collée fausserait la rareté et les trous.
const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}+#.-]*/gu;

function tokenizeSentence(sentenceText: string): Omit<Token, 'importance'>[] {
  const tokens: Omit<Token, 'importance'>[] = [];
  let match: RegExpExecArray | null;
  WORD_RE.lastIndex = 0;
  let index = 0;
  while ((match = WORD_RE.exec(sentenceText)) !== null) {
    const raw = match[0].replace(/[.]+$/, '');
    if (raw.length === 0) continue;
    const key = normalizeKey(raw);
    if (key.length === 0) continue;
    tokens.push({
      text: raw,
      key,
      index: index++,
      start: match.index,
      end: match.index + raw.length,
      isStopword: STOPWORDS.has(key),
    });
  }
  return tokens;
}

/**
 * Importance d'un mot : longueur, rareté dans la définition, casse interne
 * (JVM, Spring), présence de chiffres. Purement structurel.
 */
function scoreToken(token: Omit<Token, 'importance'>, frequency: number, position: number): number {
  if (token.isStopword) return 0;
  let score = Math.min(3, Math.log2(Math.max(2, token.key.length)));
  score += 1 / frequency; // un mot rare dans le texte est plus discriminant
  if (/[A-Z]/.test(token.text.slice(1))) score += 1.5; // JVM, BPM, camelCase
  else if (/^[A-Z]/.test(token.text) && position > 0) score += 1; // nom propre en milieu de phrase
  if (/\d/.test(token.text)) score += 0.5;
  if (token.key.length <= 2) score -= 1;
  return Math.max(0, Number(score.toFixed(3)));
}

export function analyzeDefinition(text: string): DefinitionAnalysis {
  const rawSentences = splitSentences(text);
  const frequencies = new Map<string, number>();

  const partial = rawSentences.map((sentenceText, index) => {
    const tokens = tokenizeSentence(sentenceText);
    for (const token of tokens) {
      frequencies.set(token.key, (frequencies.get(token.key) ?? 0) + 1);
    }
    return { id: `s${index}`, index, text: sentenceText, tokens };
  });

  const sentences: Sentence[] = partial.map((sentence) => ({
    ...sentence,
    tokens: sentence.tokens.map((token) => ({
      ...token,
      importance: scoreToken(token, frequencies.get(token.key) ?? 1, token.index),
    })),
  }));

  const importantTokens = sentences
    .flatMap((sentence) => sentence.tokens)
    .filter((token) => token.importance > 0)
    .sort((a, b) => b.importance - a.importance);

  return {
    sentences,
    importantTokens,
    importantPhrases: extractPhrases(sentences),
    wordCount: sentences.reduce((total, sentence) => total + sentence.tokens.length, 0),
  };
}

/**
 * Expressions de 2 à 4 mots : au plus un mot vide, jamais en début ou fin, et
 * au moins deux mots porteurs de sens. « orienté objet », « basé sur Spring ».
 */
function extractPhrases(sentences: Sentence[]): Phrase[] {
  const candidates: Phrase[] = [];

  for (const sentence of sentences) {
    const { tokens } = sentence;
    for (let size = 2; size <= 4; size += 1) {
      for (let start = 0; start + size <= tokens.length; start += 1) {
        const slice = tokens.slice(start, start + size);
        if (slice[0].isStopword || slice[slice.length - 1].isStopword) continue;
        const stopwordCount = slice.filter((token) => token.isStopword).length;
        if (stopwordCount > 1) continue;
        const meaningful = slice.filter((token) => !token.isStopword);
        if (meaningful.length < 2) continue;

        const from = slice[0].start;
        const to = slice[slice.length - 1].end;
        const text = sentence.text.slice(from, to);
        candidates.push({
          text,
          key: normalizeKey(text.replace(/\s+/g, ' ')),
          sentenceIndex: sentence.index,
          startToken: slice[0].index,
          endToken: slice[slice.length - 1].index,
          importance: Number(
            (meaningful.reduce((sum, token) => sum + token.importance, 0) / Math.sqrt(size)).toFixed(3),
          ),
        });
      }
    }
  }

  // On garde les meilleures expressions sans chevauchement, par phrase.
  const sorted = candidates.sort((a, b) => b.importance - a.importance);
  const taken: Phrase[] = [];
  for (const phrase of sorted) {
    const overlaps = taken.some(
      (kept) =>
        kept.sentenceIndex === phrase.sentenceIndex &&
        phrase.startToken <= kept.endToken &&
        kept.startToken <= phrase.endToken,
    );
    if (!overlaps) taken.push(phrase);
  }
  return taken;
}

/** Découpe une phrase en groupes de souffle, pour les jeux de remise en ordre. */
export function splitIntoChunks(sentence: Sentence, targetChunks: number): string[] {
  const { tokens, text } = sentence;
  if (tokens.length === 0) return [text];
  const count = Math.max(2, Math.min(targetChunks, Math.ceil(tokens.length / 2)));
  const perChunk = Math.ceil(tokens.length / count);
  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += perChunk) {
    const slice = tokens.slice(i, i + perChunk);
    const from = i === 0 ? 0 : slice[0].start;
    const isLast = i + perChunk >= tokens.length;
    const to = isLast ? text.length : slice[slice.length - 1].end;
    const chunk = text.slice(from, to).trim();
    if (chunk.length > 0) chunks.push(chunk);
  }
  return chunks;
}

/**
 * Similarité entre une réponse libre et la réponse attendue : proportion de
 * mots attendus réellement présents. Sert à corriger automatiquement les
 * exercices de restitution sans exiger le mot à mot exact.
 */
export function recallSimilarity(expected: string, given: string): number {
  const expectedKeys = tokenizeSentence(expected)
    .filter((token) => !token.isStopword)
    .map((token) => token.key);
  if (expectedKeys.length === 0) return normalizeKey(expected) === normalizeKey(given) ? 1 : 0;
  const givenKeys = new Set(tokenizeSentence(given).map((token) => token.key));
  const found = expectedKeys.filter((key) => givenKeys.has(key)).length;
  return Number((found / expectedKeys.length).toFixed(3));
}
