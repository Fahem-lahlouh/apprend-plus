import { db } from './db';
import type { Chapter, Course, Id, LearningDomain, LearningPath, Lesson, QuizQuestion, Flashcard } from '@/models';

/** Read/write access to the learning tree. No business rules live here. */
export const contentRepository = {
  /* Domains */
  async listDomains(includeArchived = false): Promise<LearningDomain[]> {
    const all = await db.domains.toArray();
    return all
      .filter((d) => includeArchived || !d.archived)
      .sort((a, b) => a.order - b.order);
  },
  getDomain(id: Id) {
    return db.domains.get(id);
  },
  putDomain(domain: LearningDomain) {
    return db.domains.put(domain);
  },
  async deleteDomain(id: Id) {
    const courses = await db.courses.where('domainId').equals(id).toArray();
    await Promise.all(courses.map((c) => contentRepository.deleteCourse(c.id)));
    await db.paths.where('domainId').equals(id).delete();
    await db.domains.delete(id);
  },
  async reorderDomains(orderedIds: Id[]) {
    await db.transaction('rw', db.domains, async () => {
      for (const [index, id] of orderedIds.entries()) {
        await db.domains.update(id, { order: index });
      }
    });
  },

  /* Paths */
  async listPaths(domainId: Id): Promise<LearningPath[]> {
    const paths = await db.paths.where('domainId').equals(domainId).toArray();
    return paths.sort((a, b) => a.order - b.order);
  },
  putPath(path: LearningPath) {
    return db.paths.put(path);
  },

  /* Courses */
  async listCourses(domainId?: Id): Promise<Course[]> {
    const courses = domainId
      ? await db.courses.where('domainId').equals(domainId).toArray()
      : await db.courses.toArray();
    return courses.filter((c) => !c.archived).sort((a, b) => a.order - b.order);
  },
  getCourse(id: Id) {
    return db.courses.get(id);
  },
  putCourse(course: Course) {
    return db.courses.put(course);
  },
  async deleteCourse(id: Id) {
    const chapters = await db.chapters.where('courseId').equals(id).toArray();
    await Promise.all(chapters.map((c) => contentRepository.deleteChapter(c.id)));
    await db.lessonProgress.where('courseId').equals(id).delete();
    await db.courses.delete(id);
  },

  /* Chapters */
  async listChapters(courseId: Id): Promise<Chapter[]> {
    const chapters = await db.chapters.where('courseId').equals(courseId).toArray();
    return chapters.sort((a, b) => a.order - b.order);
  },
  getChapter(id: Id) {
    return db.chapters.get(id);
  },
  putChapter(chapter: Chapter) {
    return db.chapters.put(chapter);
  },
  async deleteChapter(id: Id) {
    const lessons = await db.lessons.where('chapterId').equals(id).toArray();
    await Promise.all(lessons.map((l) => contentRepository.deleteLesson(l.id)));
    await db.chapters.delete(id);
  },

  /* Lessons */
  async listLessons(chapterId: Id): Promise<Lesson[]> {
    const lessons = await db.lessons.where('chapterId').equals(chapterId).toArray();
    return lessons.sort((a, b) => a.order - b.order);
  },
  async listLessonsByCourse(courseId: Id): Promise<Lesson[]> {
    const lessons = await db.lessons.where('courseId').equals(courseId).toArray();
    return lessons.sort((a, b) => a.order - b.order);
  },
  getLesson(id: Id) {
    return db.lessons.get(id);
  },
  putLesson(lesson: Lesson) {
    return db.lessons.put(lesson);
  },
  async deleteLesson(id: Id) {
    await db.lessonProgress.delete(id);
    await db.notes.where('lessonId').equals(id).delete();
    await db.lessons.delete(id);
  },

  /* Questions & flashcards */
  listAllQuestions() {
    return db.questions.toArray();
  },
  getQuestion(id: Id) {
    return db.questions.get(id);
  },
  getQuestions(ids: Id[]) {
    return db.questions.bulkGet(ids).then((rows) => rows.filter(Boolean) as QuizQuestion[]);
  },
  questionsByLesson(lessonId: Id) {
    return db.questions.where('lessonId').equals(lessonId).toArray();
  },
  questionsByCourse(courseId: Id) {
    return db.questions.where('courseId').equals(courseId).toArray();
  },
  questionsByDomain(domainId: Id) {
    return db.questions.where('domainId').equals(domainId).toArray();
  },
  putQuestion(question: QuizQuestion) {
    return db.questions.put(question);
  },
  deleteQuestion(id: Id) {
    return db.questions.delete(id);
  },

  listAllFlashcards() {
    return db.flashcards.toArray();
  },
  getFlashcard(id: Id) {
    return db.flashcards.get(id);
  },
  flashcardsByDomain(domainId: Id) {
    return db.flashcards.where('domainId').equals(domainId).toArray();
  },
  flashcardsByCourse(courseId: Id) {
    return db.flashcards.where('courseId').equals(courseId).toArray();
  },
  putFlashcard(card: Flashcard) {
    return db.flashcards.put(card);
  },
  async deleteFlashcard(id: Id) {
    await db.schedules.delete(id);
    await db.flashcards.delete(id);
  },
};
