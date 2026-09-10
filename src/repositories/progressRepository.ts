import { db } from './db';
import type { DayKey, DayStat, Id, LearningSession, LessonProgress, QuizAttempt } from '@/models';

export const progressRepository = {
  listLessonProgress() {
    return db.lessonProgress.toArray();
  },
  getLessonProgress(lessonId: Id) {
    return db.lessonProgress.get(lessonId);
  },
  progressByCourse(courseId: Id) {
    return db.lessonProgress.where('courseId').equals(courseId).toArray();
  },
  progressByDomain(domainId: Id) {
    return db.lessonProgress.where('domainId').equals(domainId).toArray();
  },
  putLessonProgress(progress: LessonProgress) {
    return db.lessonProgress.put(progress);
  },
  clearLessonProgress() {
    return db.lessonProgress.clear();
  },

  addSession(session: LearningSession) {
    return db.sessions.put(session);
  },
  listSessions() {
    return db.sessions.toArray();
  },
  sessionsForDay(day: DayKey) {
    return db.sessions.where('day').equals(day).toArray();
  },

  getDayStat(day: DayKey) {
    return db.dayStats.get(day);
  },
  putDayStat(stat: DayStat) {
    return db.dayStats.put(stat);
  },
  listDayStats() {
    return db.dayStats.toArray();
  },

  addAttempt(attempt: QuizAttempt) {
    return db.attempts.put(attempt);
  },
  listAttempts() {
    return db.attempts.toArray();
  },
  attemptsByTopic(topic: string) {
    return db.attempts.where('topic').equals(topic).toArray();
  },
};
