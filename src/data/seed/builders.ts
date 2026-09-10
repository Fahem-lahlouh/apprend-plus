import type {
  Chapter,
  CodeLanguage,
  ContentBlock,
  Course,
  Flashcard,
  Id,
  LearningDomain,
  LearningPath,
  Lesson,
  Level,
  QuizQuestion,
  AccentKey,
} from '@/models';

/* ------------------------- Content block shortcuts ------------------------ */

export const text = (body: string, title?: string): ContentBlock => ({ kind: 'text', text: body, title });
export const def = (term: string, body: string): ContentBlock => ({ kind: 'definition', term, text: body });
export const example = (body: string, title?: string): ContentBlock => ({ kind: 'example', text: body, title });
export const tip = (body: string): ContentBlock => ({ kind: 'tip', text: body });
export const warn = (body: string): ContentBlock => ({ kind: 'warning', text: body });
export const keypoints = (points: string[], title?: string): ContentBlock => ({ kind: 'keypoints', points, title });
export const code = (
  language: CodeLanguage,
  source: string,
  options: { caption?: string; runnable?: boolean } = {},
): ContentBlock => ({ kind: 'code', language, code: source, caption: options.caption, runnable: options.runnable });
export const quiz = (questionId: Id): ContentBlock => ({ kind: 'quiz', questionId });
export const exercise = (spec: {
  title: string;
  statement: string;
  language: CodeLanguage;
  starterCode: string;
  solution?: string;
  hint?: string;
}): ContentBlock => ({ kind: 'exercise', ...spec });
export const pronounce = (spec: {
  word: string;
  phonetic?: string;
  sentence?: string;
  translation?: string;
  lang?: string;
}): ContentBlock => ({
  kind: 'pronunciation',
  word: spec.word,
  phonetic: spec.phonetic,
  sentence: spec.sentence,
  translation: spec.translation,
  lang: spec.lang ?? 'en-US',
});

/* ------------------------------ Course specs ----------------------------- */

export interface LessonSpec {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  blocks: ContentBlock[];
}

export interface ChapterSpec {
  id: string;
  title: string;
  description?: string;
  lessons: LessonSpec[];
}

export interface CourseSpec {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: Level;
  tags: string[];
  pathId?: string;
  chapters: ChapterSpec[];
}

export interface DomainSpec {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: AccentKey;
  paths?: { id: string; title: string; description: string }[];
  courses: CourseSpec[];
  questions: QuizQuestion[];
  flashcards: SeedFlashcard[];
}

export interface SeedFlashcard {
  id: string;
  front: string;
  back: string;
  example?: string;
  lang?: string;
  courseId?: string;
  tags?: string[];
}

export interface BuiltDomain {
  domain: LearningDomain;
  paths: LearningPath[];
  courses: Course[];
  chapters: Chapter[];
  lessons: Lesson[];
  questions: QuizQuestion[];
  flashcards: Flashcard[];
}

export function buildDomain(spec: DomainSpec, order: number, now: string): BuiltDomain {
  const domain: LearningDomain = {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    icon: spec.icon,
    accent: spec.accent,
    order,
    archived: false,
    builtIn: true,
    createdAt: now,
  };

  const paths: LearningPath[] = (spec.paths ?? []).map((p, index) => ({
    id: p.id,
    domainId: spec.id,
    title: p.title,
    description: p.description,
    order: index,
  }));

  const courses: Course[] = [];
  const chapters: Chapter[] = [];
  const lessons: Lesson[] = [];

  spec.courses.forEach((courseSpec, courseIndex) => {
    const lessonCount = courseSpec.chapters.reduce((n, c) => n + c.lessons.length, 0);
    const estimated = courseSpec.chapters
      .flatMap((c) => c.lessons)
      .reduce((total, lesson) => total + lesson.minutes, 0);
    courses.push({
      id: courseSpec.id,
      domainId: spec.id,
      pathId: courseSpec.pathId,
      title: courseSpec.title,
      description: courseSpec.description,
      icon: courseSpec.icon,
      level: courseSpec.level,
      estimatedMinutes: estimated,
      tags: courseSpec.tags,
      order: courseIndex,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    void lessonCount;

    courseSpec.chapters.forEach((chapterSpec, chapterIndex) => {
      chapters.push({
        id: chapterSpec.id,
        courseId: courseSpec.id,
        title: chapterSpec.title,
        description: chapterSpec.description,
        order: chapterIndex,
      });
      chapterSpec.lessons.forEach((lessonSpec, lessonIndex) => {
        lessons.push({
          id: lessonSpec.id,
          chapterId: chapterSpec.id,
          courseId: courseSpec.id,
          domainId: spec.id,
          title: lessonSpec.title,
          summary: lessonSpec.summary,
          estimatedMinutes: lessonSpec.minutes,
          order: lessonIndex,
          blocks: lessonSpec.blocks,
        });
      });
    });
  });

  const flashcards: Flashcard[] = spec.flashcards.map((card) => ({
    id: card.id,
    domainId: spec.id,
    courseId: card.courseId,
    front: card.front,
    back: card.back,
    example: card.example,
    lang: card.lang,
    tags: card.tags ?? [],
    createdAt: now,
  }));

  return { domain, paths, courses, chapters, lessons, questions: spec.questions, flashcards };
}

/** Question factory keeping the seed files short and consistent. */
export function mcq(spec: {
  id: string;
  domainId: string;
  courseId?: string;
  lessonId?: string;
  topic: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  code?: string;
  language?: CodeLanguage;
  type?: 'mcq' | 'code_output' | 'find_bug';
  tags?: string[];
}): QuizQuestion {
  return {
    id: spec.id,
    domainId: spec.domainId,
    courseId: spec.courseId,
    lessonId: spec.lessonId,
    topic: spec.topic,
    type: spec.type ?? 'mcq',
    prompt: spec.prompt,
    code: spec.code,
    language: spec.language,
    options: spec.options,
    answer: spec.options[spec.answerIndex],
    explanation: spec.explanation,
    tags: spec.tags ?? [],
  };
}

export function trueFalse(spec: {
  id: string;
  domainId: string;
  courseId?: string;
  lessonId?: string;
  topic: string;
  prompt: string;
  answer: boolean;
  explanation: string;
  tags?: string[];
}): QuizQuestion {
  return {
    id: spec.id,
    domainId: spec.domainId,
    courseId: spec.courseId,
    lessonId: spec.lessonId,
    topic: spec.topic,
    type: 'true_false',
    prompt: spec.prompt,
    options: ['Vrai', 'Faux'],
    answer: spec.answer ? 'Vrai' : 'Faux',
    explanation: spec.explanation,
    tags: spec.tags ?? [],
  };
}

export function fillBlank(spec: {
  id: string;
  domainId: string;
  courseId?: string;
  lessonId?: string;
  topic: string;
  prompt: string;
  answer: string;
  accepted?: string[];
  explanation: string;
  tags?: string[];
}): QuizQuestion {
  return {
    id: spec.id,
    domainId: spec.domainId,
    courseId: spec.courseId,
    lessonId: spec.lessonId,
    topic: spec.topic,
    type: 'fill_blank',
    prompt: spec.prompt,
    answer: spec.answer,
    acceptedAnswers: spec.accepted,
    explanation: spec.explanation,
    tags: spec.tags ?? [],
  };
}
