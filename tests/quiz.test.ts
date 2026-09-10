import { describe, expect, it } from 'vitest';
import { checkAnswer } from '@/services/learningService';
import { search } from '@/services/searchService';
import type { Course, Flashcard, LearningDomain, Lesson, QuizQuestion } from '@/models';

const mcq: QuizQuestion = {
  id: 'q1', domainId: 'java', topic: 'Java Bases', type: 'mcq',
  prompt: 'Que signifie JVM ?',
  options: ['Java Variable Manager', 'Java Virtual Machine', 'Java Version Module'],
  answer: 'Java Virtual Machine',
  explanation: 'JVM signifie Java Virtual Machine.',
  tags: [],
};

const blank: QuizQuestion = {
  id: 'q2', domainId: 'anglais', topic: 'Anglais Present Perfect', type: 'fill_blank',
  prompt: 'She has ___ (finish) the report.',
  answer: 'finished', acceptedAnswers: ['has finished'],
  explanation: 'have/has + participe passe.', tags: [],
};

describe('answer checking', () => {
  it('accepts the exact option and rejects the others', () => {
    expect(checkAnswer(mcq, 'Java Virtual Machine').correct).toBe(true);
    expect(checkAnswer(mcq, 'Java Version Module').correct).toBe(false);
  });

  it('always returns the explanation, right or wrong', () => {
    expect(checkAnswer(mcq, 'Java Version Module').explanation).toBe(mcq.explanation);
  });

  it('is tolerant on case, accents and spacing for free text', () => {
    expect(checkAnswer(blank, '  FINISHED ').correct).toBe(true);
    expect(checkAnswer(blank, 'has finished').correct).toBe(true);
    expect(checkAnswer(blank, 'finishing').correct).toBe(false);
  });

  it('ignores punctuation in free text answers', () => {
    expect(checkAnswer({ ...blank, answer: 'record' }, 'record.').correct).toBe(true);
  });
});

const domain: LearningDomain = {
  id: 'java', name: 'Java', description: 'Coder des applications', icon: 'code',
  accent: 'violet', order: 0, archived: false, builtIn: true, createdAt: '',
};
const course: Course = {
  id: 'c1', domainId: 'java', title: 'Java moderne', description: 'Streams et lambdas',
  icon: '⚡', level: 'avance', estimatedMinutes: 30, tags: ['streams'], order: 0,
  archived: false, createdAt: '', updatedAt: '',
};
const lesson: Lesson = {
  id: 'l1', chapterId: 'ch1', courseId: 'c1', domainId: 'java', title: 'JVM, JDK et JRE',
  summary: 'La difference entre les trois sigles', estimatedMinutes: 7, order: 0,
  blocks: [{ kind: 'definition', term: 'JVM', text: 'Java Virtual Machine' }],
};
const card: Flashcard = {
  id: 'fc1', domainId: 'java', front: 'JVM', back: 'Java Virtual Machine', tags: [], createdAt: '',
};

const corpus = { domains: [domain], courses: [course], lessons: [lesson], flashcards: [card], questions: [mcq] };

describe('global search', () => {
  it('ignores queries that are too short', () => {
    expect(search(corpus, 'j')).toEqual([]);
  });

  it('finds a notion across lessons, flashcards and questions', () => {
    const kinds = search(corpus, 'JVM').map((r) => r.kind);
    expect(kinds).toContain('lesson');
    expect(kinds).toContain('flashcard');
    expect(kinds).toContain('question');
  });

  it('never places a body-only match before a title match', () => {
    const scores = search(corpus, 'JVM').map((r) => r.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
    expect(scores[0]).toBe(2);
  });

  it('searches inside lesson content blocks', () => {
    expect(search(corpus, 'Virtual Machine').length).toBeGreaterThan(0);
  });

  it('is accent and case insensitive', () => {
    expect(search(corpus, 'java moderne').some((r) => r.kind === 'course')).toBe(true);
  });

  it('returns nothing for an unknown term', () => {
    expect(search(corpus, 'kubernetes')).toEqual([]);
  });
});
