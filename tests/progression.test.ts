import { describe, expect, it } from 'vitest';
import { chapterProgress, countCompletedCourses, courseProgress, domainProgress, nextLesson, summarise } from '@/services/progression';
import type { Course, Lesson, LessonProgress } from '@/models';

const lesson = (id: string, courseId: string, domainId: string, chapterId: string, order: number): Lesson => ({
  id, chapterId, courseId, domainId, title: id, summary: '', estimatedMinutes: 5, order, blocks: [],
});

const done = (lessonId: string, courseId: string, domainId: string): LessonProgress => ({
  lessonId, courseId, domainId, status: 'completed', startedAt: '', completedAt: '',
});

const lessons = [
  lesson('l1', 'c1', 'java', 'ch1', 0),
  lesson('l2', 'c1', 'java', 'ch1', 1),
  lesson('l3', 'c1', 'java', 'ch2', 2),
  lesson('l4', 'c2', 'java', 'ch3', 0),
  lesson('l5', 'c3', 'data', 'ch4', 0),
];

describe('progression', () => {
  it('reports zero on an empty course rather than dividing by zero', () => {
    expect(summarise(0, 0)).toEqual({ total: 0, completed: 0, percent: 0, status: 'not_started' });
  });

  it('computes course progress from completed lessons only', () => {
    const progress = [done('l1', 'c1', 'java')];
    const result = courseProgress(lessons.filter((l) => l.courseId === 'c1'), progress);
    expect(result.completed).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percent).toBe(33);
    expect(result.status).toBe('in_progress');
  });

  it('marks a course completed once every lesson is done', () => {
    const progress = ['l1', 'l2', 'l3'].map((id) => done(id, 'c1', 'java'));
    expect(courseProgress(lessons.filter((l) => l.courseId === 'c1'), progress).status).toBe('completed');
  });

  it('weights a domain by lessons, not by courses', () => {
    const progress = [done('l1', 'c1', 'java'), done('l4', 'c2', 'java')];
    const java = domainProgress(lessons, progress, 'java');
    expect(java.total).toBe(4);
    expect(java.completed).toBe(2);
    expect(java.percent).toBe(50);
    expect(domainProgress(lessons, progress, 'data').percent).toBe(0);
  });

  it('scopes chapter progress to its own lessons', () => {
    const progress = [done('l1', 'c1', 'java')];
    expect(chapterProgress(lessons, progress, 'ch1').percent).toBe(50);
    expect(chapterProgress(lessons, progress, 'ch2').percent).toBe(0);
  });

  it('counts finished courses and ignores empty ones', () => {
    const courses = [
      { id: 'c1' }, { id: 'c2' }, { id: 'c3' }, { id: 'empty' },
    ] as Course[];
    const progress = [done('l4', 'c2', 'java')];
    expect(countCompletedCourses(courses, lessons, progress)).toBe(1);
  });

  it('picks the first unfinished lesson in order', () => {
    const progress = [done('l1', 'c1', 'java')];
    expect(nextLesson(lessons.filter((l) => l.courseId === 'c1'), progress)?.id).toBe('l2');
  });

  it('returns nothing to continue when the course is finished', () => {
    const progress = ['l1', 'l2', 'l3'].map((id) => done(id, 'c1', 'java'));
    expect(nextLesson(lessons.filter((l) => l.courseId === 'c1'), progress)).toBeUndefined();
  });
});
