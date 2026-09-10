import type { BadgeDefinition } from '@/models';

/* ------------------------------- XP rules ------------------------------- */

export const XP_RULES = {
  lessonCompleted: 10,
  quizCorrect: 5,
  quizPerfectBonus: 20,
  flashcardReviewed: 2,
  gameCompleted: 8,
  dailyGoalMet: 25,
} as const;

export type XpReason = keyof typeof XP_RULES;

export function xpFor(reason: XpReason): number {
  return XP_RULES[reason];
}

/* -------------------------------- Levels -------------------------------- */

/**
 * Levels grow quadratically: level n starts at 50 * n * (n - 1) XP.
 * Level 1: 0, level 2: 100, level 3: 300, level 4: 600...
 */
export function xpThresholdForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  return 50 * n * (n - 1);
}

export function levelForXp(xp: number): number {
  const safe = Math.max(0, xp);
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= safe) level += 1;
  return level;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const start = xpThresholdForLevel(level);
  const end = xpThresholdForLevel(level + 1);
  const span = end - start;
  const into = Math.max(0, xp - start);
  return {
    level,
    xpIntoLevel: into,
    xpForNextLevel: span,
    percent: span === 0 ? 0 : Math.round((into / span) * 100),
  };
}

/* -------------------------------- Badges -------------------------------- */

export const BADGES: BadgeDefinition[] = [
  { id: 'first_lesson', label: 'Première leçon', description: 'Termine ta première leçon.', icon: '🎯' },
  { id: 'first_course', label: 'Premier cours termine', description: 'Termine un cours en entier.', icon: '🏁' },
  { id: 'streak_7', label: 'Série de 7 jours', description: '7 jours consécutifs a atteindre ton objectif.', icon: '🔥' },
  { id: 'streak_30', label: 'Série de 30 jours', description: '30 jours consécutifs.', icon: '🌟' },
  { id: 'quiz_100', label: '100 bonnes réponses', description: 'Réponds correctement à 100 questions.', icon: '🧠' },
  { id: 'cards_100', label: '100 cartes maîtrisées', description: 'Maîtrise 100 flashcards.', icon: '🃏' },
  { id: 'level_5', label: 'Niveau 5', description: 'Atteins le niveau 5.', icon: '⭐' },
  { id: 'level_10', label: 'Niveau 10', description: 'Atteins le niveau 10.', icon: '💎' },
  { id: 'coder', label: 'Premier code exécute', description: 'Execute ton premier programme.', icon: '💻' },
];

export interface BadgeContext {
  lessonsCompleted: number;
  coursesCompleted: number;
  currentStreak: number;
  correctAnswers: number;
  masteredCards: number;
  level: number;
  codeRuns: number;
}

/** Returns the ids of every badge whose condition is satisfied. */
export function evaluateBadges(ctx: BadgeContext): string[] {
  const unlocked: string[] = [];
  if (ctx.lessonsCompleted >= 1) unlocked.push('first_lesson');
  if (ctx.coursesCompleted >= 1) unlocked.push('first_course');
  if (ctx.currentStreak >= 7) unlocked.push('streak_7');
  if (ctx.currentStreak >= 30) unlocked.push('streak_30');
  if (ctx.correctAnswers >= 100) unlocked.push('quiz_100');
  if (ctx.masteredCards >= 100) unlocked.push('cards_100');
  if (ctx.level >= 5) unlocked.push('level_5');
  if (ctx.level >= 10) unlocked.push('level_10');
  if (ctx.codeRuns >= 1) unlocked.push('coder');
  return unlocked;
}
