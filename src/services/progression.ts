import type { Course, Id, Lesson, LessonProgress } from '@/models';
import { percent } from '@/utils/array';

export interface ProgressSummary {
  total: number;
  completed: number;
  percent: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export function summarise(totalLessons: number, completedLessons: number): ProgressSummary {
  const pct = percent(completedLessons, totalLessons);
  return {
    total: totalLessons,
    completed: completedLessons,
    percent: pct,
    status: completedLessons === 0 ? 'not_started' : pct >= 100 ? 'completed' : 'in_progress',
  };
}

/** Progress of one course, derived from real lesson completion. */
export function courseProgress(lessons: Lesson[], progress: LessonProgress[]): ProgressSummary {
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId));
  return summarise(lessons.length, lessons.filter((l) => completed.has(l.id)).length);
}

/**
 * Progress of a domain, counted in lessons rather than in courses so a large
 * course weighs more than a two-lesson one.
 */
export function domainProgress(lessons: Lesson[], progress: LessonProgress[], domainId: Id): ProgressSummary {
  const domainLessons = lessons.filter((l) => l.domainId === domainId);
  const completed = new Set(
    progress.filter((p) => p.status === 'completed' && p.domainId === domainId).map((p) => p.lessonId),
  );
  return summarise(domainLessons.length, domainLessons.filter((l) => completed.has(l.id)).length);
}

export function chapterProgress(lessons: Lesson[], progress: LessonProgress[], chapterId: Id): ProgressSummary {
  const chapterLessons = lessons.filter((l) => l.chapterId === chapterId);
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId));
  return summarise(chapterLessons.length, chapterLessons.filter((l) => completed.has(l.id)).length);
}

export function countCompletedCourses(
  courses: Course[],
  lessons: Lesson[],
  progress: LessonProgress[],
): number {
  return courses.filter((course) => {
    const courseLessons = lessons.filter((l) => l.courseId === course.id);
    if (courseLessons.length === 0) return false;
    return courseProgress(courseLessons, progress).percent >= 100;
  }).length;
}

/** The next lesson to study inside a course: first one not completed. */
export function nextLesson(lessons: Lesson[], progress: LessonProgress[]): Lesson | undefined {
  const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId));
  return [...lessons].sort((a, b) => a.order - b.order).find((l) => !completed.has(l.id));
}
