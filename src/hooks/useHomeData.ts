import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/repositories/db';
import { computeStreak } from '@/services/streak';
import { domainProgress } from '@/services/progression';
import { recommendActivities } from '@/services/recommendation';
import { todaysReminders } from '@/services/reminders';
import { toDayKey } from '@/utils/date';
import { usePreferences } from './usePreferences';
import { levelProgress } from '@/services/gamification';

/** Everything the home screen renders, computed from live IndexedDB data. */
export function useHomeData() {
  const { preferences } = usePreferences();

  return useLiveQuery(async () => {
    const [domains, lessons, progress, stats, reminders, schedules, attempts, reviewItems, bookmark, profile] =
      await Promise.all([
        db.domains.toArray(),
        db.lessons.toArray(),
        db.lessonProgress.toArray(),
        db.dayStats.toArray(),
        db.reminders.toArray(),
        db.schedules.toArray(),
        db.attempts.toArray(),
        db.reviewItems.toArray(),
        db.bookmarks.get('last'),
        db.profile.get('profile'),
      ]);

    const today = toDayKey();
    const todayStat = stats.find((s) => s.day === today);
    const goalSeconds = preferences.dailyGoalMinutes * 60;
    const doneSeconds = todayStat?.seconds ?? 0;
    const visibleDomains = domains.filter((d) => !d.archived).sort((a, b) => a.order - b.order);

    return {
      domains: visibleDomains.map((domain) => ({
        domain,
        progress: domainProgress(lessons, progress, domain.id),
      })),
      goal: {
        doneSeconds,
        goalSeconds,
        percent: goalSeconds > 0 ? Math.min(100, Math.round((doneSeconds / goalSeconds) * 100)) : 0,
      },
      streak: computeStreak(stats),
      reminders: todaysReminders(reminders.filter((r) => r.enabled)),
      allRemindersCount: reminders.length,
      recommendations: recommendActivities({
        bookmark,
        schedules,
        attempts,
        reviewItems,
        domains: visibleDomains,
        todayStat,
      }),
      level: levelProgress(profile?.xp ?? 0),
      xp: profile?.xp ?? 0,
    };
  }, [preferences.dailyGoalMinutes]);
}
