import { db } from '@/repositories/db';
import type { DefinitionProgress, Id, Lesson, LessonProgress, MasteryState, QuizAttempt } from '@/models';
import { lessonMastery, type LessonMastery } from './curriculum';

/**
 * Assemble les signaux dispersés (leçons terminées, réponses de quiz, niveau des
 * définitions) et délègue la décision à `lessonMastery`, qui reste pure.
 *
 * Les réponses de quiz ne portent pas d'identifiant de leçon : on remonte de
 * `attempt.questionId` vers la question, puis vers sa leçon.
 */
export async function loadMasteryMap(lessons: Lesson[]): Promise<Map<Id, LessonMastery>> {
  if (lessons.length === 0) return new Map();

  const lessonIds = lessons.map((l) => l.id);
  const definitionIds = lessons.flatMap((l) => l.definitionIds ?? []);

  const [questions, attempts, progressRows, definitionRows] = await Promise.all([
    db.questions.where('lessonId').anyOf(lessonIds).toArray(),
    db.attempts.toArray(),
    db.lessonProgress.bulkGet(lessonIds),
    definitionIds.length > 0 ? db.definitionProgress.bulkGet(definitionIds) : Promise.resolve([]),
  ]);

  const lessonOfQuestion = new Map<Id, Id>();
  for (const q of questions) {
    if (q.lessonId) lessonOfQuestion.set(q.id, q.lessonId);
  }

  const attemptsByLesson = new Map<Id, QuizAttempt[]>();
  for (const attempt of attempts) {
    const lessonId = lessonOfQuestion.get(attempt.questionId);
    if (!lessonId) continue;
    const list = attemptsByLesson.get(lessonId);
    if (list) list.push(attempt);
    else attemptsByLesson.set(lessonId, [attempt]);
  }

  const progressById = new Map<Id, LessonProgress>();
  for (const row of progressRows) {
    if (row) progressById.set(row.lessonId, row);
  }

  const definitionProgressById = new Map<Id, DefinitionProgress>();
  for (const row of definitionRows) {
    if (row) definitionProgressById.set(row.definitionId, row);
  }

  const result = new Map<Id, LessonMastery>();
  for (const lesson of lessons) {
    result.set(
      lesson.id,
      lessonMastery({
        lesson,
        progress: progressById.get(lesson.id),
        attempts: attemptsByLesson.get(lesson.id) ?? [],
        definitionProgress: (lesson.definitionIds ?? [])
          .map((id) => definitionProgressById.get(id))
          .filter((row): row is DefinitionProgress => row !== undefined),
      }),
    );
  }
  return result;
}

export function masteryStates(map: Map<Id, LessonMastery>): Map<Id, MasteryState> {
  return new Map([...map].map(([id, mastery]) => [id, mastery.state]));
}
