import type {
  ActivityKind,
  CardSchedule,
  Flashcard,
  Id,
  Lesson,
  QuizQuestion,
  ReviewGrade,
} from '@/models';
import { db } from '@/repositories/db';
import { contentRepository } from '@/repositories/contentRepository';
import { progressRepository } from '@/repositories/progressRepository';
import { srsRepository } from '@/repositories/srsRepository';
import { personalRepository } from '@/repositories/personalRepository';
import { settingsRepository } from '@/repositories/settingsRepository';
import { applySecondsToDay, computeStreak } from './streak';
import { countCompletedCourses } from './progression';
import { evaluateBadges, levelForXp, xpFor, type XpReason } from './gamification';
import { initialSchedule, isMastered, review } from './spacedRepetition';
import { newId } from '@/utils/id';
import { toDayKey } from '@/utils/date';
import { normalizeAnswer } from '@/utils/text';

/**
 * Orchestration layer: the only place allowed to write across several stores.
 * Components call these functions; they never touch repositories directly for
 * anything that changes state.
 */

export interface XpAward {
  amount: number;
  reason: XpReason;
  newBadges: string[];
}

async function addXp(amount: number, reason: XpReason): Promise<XpAward> {
  const profile = await settingsRepository.getProfile();
  const updated = { ...profile, xp: profile.xp + amount };
  await settingsRepository.saveProfile(updated);
  const day = toDayKey();
  const prefs = await settingsRepository.getPreferences();
  const existing = await progressRepository.getDayStat(day);
  await progressRepository.putDayStat(
    applySecondsToDay(existing, day, 0, prefs.dailyGoalMinutes * 60, amount),
  );
  const newBadges = await refreshBadges();
  return { amount, reason, newBadges };
}

/** Recomputes badge conditions and stores newly unlocked ones. */
export async function refreshBadges(): Promise<string[]> {
  const [profile, progress, lessons, courses, attempts, schedules, stats, existing] = await Promise.all([
    settingsRepository.getProfile(),
    progressRepository.listLessonProgress(),
    db.lessons.toArray(),
    contentRepository.listCourses(),
    progressRepository.listAttempts(),
    srsRepository.list(),
    progressRepository.listDayStats(),
    personalRepository.listBadges(),
  ]);

  const unlocked = evaluateBadges({
    lessonsCompleted: progress.filter((p) => p.status === 'completed').length,
    coursesCompleted: countCompletedCourses(courses, lessons, progress),
    currentStreak: computeStreak(stats).current,
    correctAnswers: attempts.filter((a) => a.correct).length,
    masteredCards: schedules.filter(isMastered).length,
    level: levelForXp(profile.xp),
    codeRuns: codeRunCounter.get(),
  });

  const known = new Set(existing.map((b) => b.id));
  const fresh = unlocked.filter((id) => !known.has(id));
  await Promise.all(fresh.map((id) => personalRepository.putBadge({ id, unlockedAt: new Date().toISOString() })));
  return fresh;
}

/** Code runs are a device-local counter, not learning data worth syncing. */
export const codeRunCounter = {
  key: 'apprend-plus.code-runs',
  get(): number {
    try {
      return Number(localStorage.getItem(this.key) ?? '0');
    } catch {
      return 0;
    }
  },
  increment(): void {
    try {
      localStorage.setItem(this.key, String(this.get() + 1));
    } catch {
      /* storage unavailable - the counter is cosmetic */
    }
  },
};

/* ---------------------------- Learning sessions -------------------------- */

export interface SessionInput {
  durationSec: number;
  activity: ActivityKind;
  domainId?: Id;
  courseId?: Id;
  lessonId?: Id;
  startedAt?: Date;
}

export async function recordSession(input: SessionInput): Promise<void> {
  if (input.durationSec < 5) return; // ignore accidental taps
  const endedAt = new Date();
  const startedAt = input.startedAt ?? new Date(endedAt.getTime() - input.durationSec * 1000);
  const day = toDayKey(endedAt);

  await progressRepository.addSession({
    id: newId('sess'),
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    durationSec: Math.round(input.durationSec),
    day,
    domainId: input.domainId,
    courseId: input.courseId,
    lessonId: input.lessonId,
    activity: input.activity,
  });

  const prefs = await settingsRepository.getPreferences();
  const goalSeconds = prefs.dailyGoalMinutes * 60;
  const existing = await progressRepository.getDayStat(day);
  const updated = applySecondsToDay(existing, day, Math.round(input.durationSec), goalSeconds);
  await progressRepository.putDayStat(updated);

  // Daily goal bonus, granted once per day.
  if (updated.goalMet && !existing?.goalMet) {
    await addXp(xpFor('dailyGoalMet'), 'dailyGoalMet');
  }
}

/* --------------------------------- Lessons -------------------------------- */

export async function startLesson(lesson: Lesson): Promise<void> {
  const existing = await progressRepository.getLessonProgress(lesson.id);
  if (!existing) {
    await progressRepository.putLessonProgress({
      lessonId: lesson.id,
      courseId: lesson.courseId,
      domainId: lesson.domainId,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    });
  }
  const course = await contentRepository.getCourse(lesson.courseId);
  await personalRepository.putBookmark({
    id: 'last',
    domainId: lesson.domainId,
    courseId: lesson.courseId,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    courseTitle: course?.title ?? '',
    at: new Date().toISOString(),
  });
}

export async function completeLesson(lesson: Lesson): Promise<XpAward | null> {
  const existing = await progressRepository.getLessonProgress(lesson.id);
  if (existing?.status === 'completed') return null;
  await progressRepository.putLessonProgress({
    lessonId: lesson.id,
    courseId: lesson.courseId,
    domainId: lesson.domainId,
    status: 'completed',
    startedAt: existing?.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
  });
  return addXp(xpFor('lessonCompleted'), 'lessonCompleted');
}

export async function reopenLesson(lessonId: Id): Promise<void> {
  const existing = await progressRepository.getLessonProgress(lessonId);
  if (!existing) return;
  await progressRepository.putLessonProgress({ ...existing, status: 'in_progress', completedAt: undefined });
}

/* ---------------------------------- Quiz ---------------------------------- */

export interface AnswerCheck {
  correct: boolean;
  expected: string;
  explanation: string;
}

/** Pure answer checking, shared by lessons, quizzes and games. */
export function checkAnswer(question: QuizQuestion, answer: string): AnswerCheck {
  const expected = question.answer;
  let correct: boolean;
  switch (question.type) {
    case 'free_text':
    case 'fill_blank': {
      const accepted = [expected, ...(question.acceptedAnswers ?? [])].map(normalizeAnswer);
      correct = accepted.includes(normalizeAnswer(answer));
      break;
    }
    default:
      correct = normalizeAnswer(answer) === normalizeAnswer(expected);
  }
  return { correct, expected, explanation: question.explanation };
}

export async function recordAttempt(
  question: QuizQuestion,
  correct: boolean,
  source: 'lesson' | 'quiz' | 'game' | 'review',
): Promise<XpAward | null> {
  await progressRepository.addAttempt({
    id: newId('att'),
    questionId: question.id,
    domainId: question.domainId,
    courseId: question.courseId,
    topic: question.topic,
    correct,
    answeredAt: new Date().toISOString(),
    source,
  });
  if (!correct) return null;
  return addXp(xpFor('quizCorrect'), 'quizCorrect');
}

export async function awardPerfectQuiz(): Promise<XpAward> {
  return addXp(xpFor('quizPerfectBonus'), 'quizPerfectBonus');
}

export async function awardGameCompleted(): Promise<XpAward> {
  return addXp(xpFor('gameCompleted'), 'gameCompleted');
}

/* ------------------------------- Flashcards ------------------------------- */

export async function reviewFlashcard(card: Flashcard, grade: ReviewGrade): Promise<XpAward> {
  const existing = (await srsRepository.get(card.id)) ?? initialSchedule(card.id);
  const next = review(existing, grade);
  await srsRepository.put(next);
  return addXp(xpFor('flashcardReviewed'), 'flashcardReviewed');
}

/** Cards due now, plus never-seen cards, limited to a session-sized batch. */
export async function buildReviewQueue(
  options: { domainId?: Id; courseId?: Id; limit?: number } = {},
): Promise<{ card: Flashcard; schedule: CardSchedule }[]> {
  const cards = options.courseId
    ? await contentRepository.flashcardsByCourse(options.courseId)
    : options.domainId
      ? await contentRepository.flashcardsByDomain(options.domainId)
      : await contentRepository.listAllFlashcards();

  const now = Date.now();
  // Cards that were never reviewed get a schedule dated at `now`, not at the
  // moment this line runs: otherwise a brand-new card is a millisecond in the
  // future and gets filtered out of its own first session.
  const withSchedules = await Promise.all(
    cards.map(async (card) => ({
      card,
      schedule: (await srsRepository.get(card.id)) ?? initialSchedule(card.id, new Date(now)),
    })),
  );

  return withSchedules
    .filter((entry) => new Date(entry.schedule.dueAt).getTime() <= now)
    .sort((a, b) => {
      if (a.schedule.repetitions !== b.schedule.repetitions) {
        return a.schedule.repetitions - b.schedule.repetitions;
      }
      return new Date(a.schedule.dueAt).getTime() - new Date(b.schedule.dueAt).getTime();
    })
    .slice(0, options.limit ?? 20);
}

/* ---------------------------- Favorites / review -------------------------- */

export async function toggleFavorite(kind: Parameters<typeof favoriteId>[0], refId: Id, label: string) {
  const id = favoriteId(kind, refId);
  const existing = await personalRepository.getFavorite(id);
  if (existing) {
    await personalRepository.deleteFavorite(id);
    return false;
  }
  await personalRepository.putFavorite({ id, kind, refId, label, createdAt: new Date().toISOString() });
  return true;
}

export function favoriteId(kind: 'domain' | 'course' | 'lesson' | 'flashcard' | 'question', refId: Id): string {
  return `${kind}:${refId}`;
}

export async function addToReview(
  kind: 'domain' | 'course' | 'lesson' | 'flashcard' | 'question',
  refId: Id,
  label: string,
  reason?: string,
): Promise<void> {
  const now = new Date();
  await personalRepository.putReviewItem({
    id: `${kind}:${refId}`,
    kind,
    refId,
    label,
    reason,
    createdAt: now.toISOString(),
    dueAt: new Date(now.getTime() + 86_400_000).toISOString(),
  });
}

export async function resolveReviewItem(id: Id): Promise<void> {
  await personalRepository.deleteReviewItem(id);
}
