import type { Bookmark, CardSchedule, DayStat, LearningDomain, QuizAttempt, ReviewItem } from '@/models';
import { isDue } from './spacedRepetition';
import { weakTopics } from './analytics';
import type { IconName } from '@/design-system/Icon';

export interface Recommendation {
  id: string;
  title: string;
  body: string;
  cta: string;
  to: string;
  icon: IconName;
  accent: 'violet' | 'green' | 'pink' | 'amber';
  priority: number;
}

export interface RecommendationInput {
  bookmark?: Bookmark;
  schedules: CardSchedule[];
  attempts: QuizAttempt[];
  reviewItems: ReviewItem[];
  domains: LearningDomain[];
  todayStat?: DayStat;
  now?: Date;
}

/**
 * Builds the "what should I do next" suggestions shown on the home screen.
 * Everything is computed from local data - no remote model involved.
 */
export function recommendActivities(input: RecommendationInput): Recommendation[] {
  const now = input.now ?? new Date();
  const out: Recommendation[] = [];

  const dueCards = input.schedules.filter((s) => isDue(s, now));
  if (dueCards.length > 0) {
    out.push({
      id: 'due-cards',
      title: `${dueCards.length} flashcard${dueCards.length > 1 ? 's' : ''} à réviser`,
      body: 'La révision espacée te les représente au bon moment.',
      cta: 'Réviser maintenant',
      to: '/flashcards',
      icon: 'cards',
      accent: 'green',
      priority: 90,
    });
  }

  const weak = weakTopics(input.attempts, 1);
  if (weak.length > 0) {
    const topic = weak[0];
    out.push({
      id: `weak-${topic.topic}`,
      title: `À renforcer : ${topic.topic}`,
      body: `Tu es à ${topic.successRate} % de réussite. Un quiz rapide de 5 questions peut aider.`,
      cta: 'Lancer un quiz',
      to: `/games/quiz?topic=${encodeURIComponent(topic.topic)}`,
      icon: 'target',
      accent: 'pink',
      priority: 80,
    });
  }

  const pendingReviews = input.reviewItems.filter((item) => !item.resolvedAt);
  if (pendingReviews.length > 0) {
    out.push({
      id: 'review-list',
      title: `Tu as ${pendingReviews.length} notion${pendingReviews.length > 1 ? 's' : ''} à revoir`,
      body: pendingReviews
        .slice(0, 3)
        .map((r) => r.label)
        .join(' · '),
      cta: 'Voir la liste',
      to: '/progress/review',
      icon: 'rotate',
      accent: 'amber',
      priority: 70,
    });
  }

  if (input.bookmark) {
    out.push({
      id: 'continue',
      title: `Continuer ${input.bookmark.courseTitle}`,
      body: `Tu t’es arrêté sur « ${input.bookmark.lessonTitle} ».`,
      cta: 'Reprendre',
      to: `/courses/lesson/${input.bookmark.lessonId}`,
      icon: 'play',
      accent: 'violet',
      priority: 100,
    });
  }

  if (out.length === 0 && input.domains.length > 0) {
    const domain = input.domains[0];
    out.push({
      id: 'start',
      title: `Commencer ${domain.name}`,
      body: domain.description,
      cta: 'Ouvrir le domaine',
      to: `/courses/domain/${domain.id}`,
      icon: 'sparkle',
      accent: 'violet',
      priority: 10,
    });
  }

  return out.sort((a, b) => b.priority - a.priority);
}
