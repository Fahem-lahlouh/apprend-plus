import type { Course, Flashcard, LearningDomain, Lesson, QuizQuestion } from '@/models';
import { includesQuery } from '@/utils/text';
import type { IconName } from '@/design-system/Icon';

export type SearchKind = 'domain' | 'course' | 'lesson' | 'flashcard' | 'question';

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  to: string;
  icon: IconName;
  score: number;
}

export interface SearchCorpus {
  domains: LearningDomain[];
  courses: Course[];
  lessons: Lesson[];
  flashcards: Flashcard[];
  questions: QuizQuestion[];
}

const KIND_ICON: Record<SearchKind, IconName> = {
  domain: 'sparkle',
  course: 'book',
  lesson: 'note',
  flashcard: 'cards',
  question: 'trophy',
};

/** Simple, predictable ranking: title matches beat body matches. */
export function search(corpus: SearchCorpus, rawQuery: string, limit = 30): SearchResult[] {
  const query = rawQuery.trim();
  if (query.length < 2) return [];
  const results: SearchResult[] = [];

  const push = (
    kind: SearchKind,
    id: string,
    title: string,
    subtitle: string,
    to: string,
    haystacks: string[],
  ) => {
    const titleHit = includesQuery(title, query);
    const bodyHit = haystacks.some((h) => includesQuery(h, query));
    if (!titleHit && !bodyHit) return;
    results.push({ id: `${kind}:${id}`, kind, title, subtitle, to, icon: KIND_ICON[kind], score: titleHit ? 2 : 1 });
  };

  for (const domain of corpus.domains) {
    push('domain', domain.id, domain.name, 'Domaine', `/courses/domain/${domain.id}`, [domain.description]);
  }
  for (const course of corpus.courses) {
    push('course', course.id, course.title, 'Cours', `/courses/course/${course.id}`, [
      course.description,
      ...course.tags,
    ]);
  }
  for (const lesson of corpus.lessons) {
    const text = lesson.blocks
      .map((block) => JSON.stringify(block))
      .join(' ');
    push('lesson', lesson.id, lesson.title, 'Leçon', `/courses/lesson/${lesson.id}`, [lesson.summary, text]);
  }
  for (const card of corpus.flashcards) {
    push('flashcard', card.id, card.front, 'Flashcard', `/flashcards?card=${card.id}`, [card.back, card.example ?? '']);
  }
  for (const question of corpus.questions) {
    push('question', question.id, question.prompt, `Question · ${question.topic}`, `/games/quiz?question=${question.id}`, [
      question.explanation,
      ...(question.options ?? []),
    ]);
  }

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}
