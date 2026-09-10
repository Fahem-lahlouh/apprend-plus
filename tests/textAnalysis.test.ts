import { describe, expect, it } from 'vitest';
import {
  analyzeDefinition,
  normalizeKey,
  recallSimilarity,
  splitIntoChunks,
  splitSentences,
} from '@/services/textAnalysis';

describe('découpage en phrases', () => {
  it('sépare sur la ponctuation forte', () => {
    expect(splitSentences('Java est un langage. Il est portable.')).toEqual([
      'Java est un langage.',
      'Il est portable.',
    ]);
  });

  it('ne coupe pas un nombre décimal', () => {
    expect(splitSentences('La version 3.5 est sortie.')).toEqual(['La version 3.5 est sortie.']);
  });

  it('garde une phrase sans ponctuation finale', () => {
    expect(splitSentences('Docker isole une application')).toEqual(['Docker isole une application']);
  });

  it('renvoie une liste vide sur du vide', () => {
    expect(splitSentences('   ')).toEqual([]);
  });
});

describe('analyse générique', () => {
  it('écarte les mots vides des mots importants', () => {
    const analysis = analyzeDefinition('Le conteneur isole une application dans un environnement.');
    const keys = analysis.importantTokens.map((token) => token.key);
    expect(keys).toContain('conteneur');
    expect(keys).not.toContain('le');
    expect(keys).not.toContain('une');
    expect(keys).not.toContain('dans');
  });

  it('traite un sujet technique et un sujet de langue avec le même code', () => {
    const java = analyzeDefinition('Java est un langage de programmation orienté objet.');
    const anglais = analyzeDefinition('Le present perfect relie un fait passé au présent.');
    expect(java.importantTokens.map((t) => t.key)).toContain('objet');
    expect(anglais.importantTokens.map((t) => t.key)).toContain('perfect');
  });

  it('privilégie les sigles et la casse interne', () => {
    const analysis = analyzeDefinition('Le code est exécuté par la JVM sur la machine.');
    expect(analysis.importantTokens[0].text).toBe('JVM');
  });

  it('coupe les élisions pour ne pas coller le déterminant au mot', () => {
    const analysis = analyzeDefinition("On l'emploie avec since.");
    expect(analysis.importantTokens.map((t) => t.key)).toContain('emploie');
  });

  it('extrait des expressions de plusieurs mots sans les faire se chevaucher', () => {
    const analysis = analyzeDefinition('Java est un langage de programmation orienté objet.');
    expect(analysis.importantPhrases.length).toBeGreaterThan(0);
    for (const phrase of analysis.importantPhrases) {
      expect(phrase.text.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
    }
    const spans = analysis.importantPhrases.map((p) => [p.startToken, p.endToken] as const);
    for (let i = 0; i < spans.length; i += 1) {
      for (let j = i + 1; j < spans.length; j += 1) {
        const overlap = spans[i][0] <= spans[j][1] && spans[j][0] <= spans[i][1];
        expect(overlap).toBe(false);
      }
    }
  });

  it('donne des décalages qui permettent de reconstruire la phrase exactement', () => {
    const text = 'Docker isole une application dans un conteneur léger.';
    const [sentence] = analyzeDefinition(text).sentences;
    for (const token of sentence.tokens) {
      expect(sentence.text.slice(token.start, token.end)).toBe(token.text);
    }
  });

  it('ne renvoie rien sur un texte vide', () => {
    const analysis = analyzeDefinition('');
    expect(analysis.sentences).toEqual([]);
    expect(analysis.wordCount).toBe(0);
  });
});

describe('découpage en morceaux', () => {
  it('reconstitue la phrase entière une fois recollé', () => {
    const [sentence] = analyzeDefinition('Docker isole une application dans un conteneur léger.').sentences;
    const chunks = splitIntoChunks(sentence, 3);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    expect(chunks.join(' ')).toBe(sentence.text);
  });
});

describe('similarité de restitution', () => {
  it('vaut 1 sur une restitution exacte', () => {
    expect(recallSimilarity('un conteneur léger', 'un conteneur léger')).toBe(1);
  });

  it('tolère les mots vides et la casse', () => {
    expect(recallSimilarity('un conteneur léger', 'CONTENEUR leger')).toBe(1);
  });

  it('baisse quand il manque un mot porteur de sens', () => {
    expect(recallSimilarity('un conteneur léger isolé', 'un conteneur')).toBeLessThan(0.5);
  });

  it('vaut 0 sur une réponse hors sujet', () => {
    expect(recallSimilarity('conteneur léger', 'bonjour tout le monde')).toBe(0);
  });
});

describe('normalisation', () => {
  it('ignore accents, casse et ponctuation', () => {
    expect(normalizeKey('Orienté,')).toBe(normalizeKey('oriente'));
  });
});
