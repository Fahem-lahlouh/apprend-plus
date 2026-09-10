import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { EmptyState, Icon, ProgressBar, Section } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import {
  dailySeries,
  overallSuccessRate,
  secondsByDomain,
  secondsInRange,
  startOfMonthKey,
  startOfWeekKey,
  weakTopics,
} from '@/services/analytics';
import { computeStreak } from '@/services/streak';
import { countCompletedCourses, domainProgress } from '@/services/progression';
import { levelProgress, BADGES } from '@/services/gamification';
import { formatDuration, toDayKey } from '@/utils/date';
import './progress.css';

export function ProgressScreen() {
  const data = useLiveQuery(async () => {
    const [domains, lessons, courses, progress, sessions, stats, attempts, profile, badges] = await Promise.all([
      db.domains.toArray(),
      db.lessons.toArray(),
      db.courses.toArray(),
      db.lessonProgress.toArray(),
      db.sessions.toArray(),
      db.dayStats.toArray(),
      db.attempts.toArray(),
      db.profile.get('profile'),
      db.badges.toArray(),
    ]);

    const today = toDayKey();
    const byDomain = secondsByDomain(sessions);

    return {
      today: secondsInRange(sessions, today, today),
      week: secondsInRange(sessions, startOfWeekKey(), today),
      month: secondsInRange(sessions, startOfMonthKey(), today),
      total: sessions.reduce((sum, s) => sum + s.durationSec, 0),
      lessonsCompleted: progress.filter((p) => p.status === 'completed').length,
      lessonsTotal: lessons.length,
      coursesCompleted: countCompletedCourses(courses, lessons, progress),
      successRate: overallSuccessRate(attempts),
      attemptCount: attempts.length,
      streak: computeStreak(stats),
      level: levelProgress(profile?.xp ?? 0),
      xp: profile?.xp ?? 0,
      series: dailySeries(stats, 7),
      weak: weakTopics(attempts, 5),
      badges: new Set(badges.map((b) => b.id)),
      domains: domains
        .filter((d) => !d.archived)
        .map((domain) => ({
          domain,
          seconds: byDomain[domain.id] ?? 0,
          progress: domainProgress(lessons, progress, domain.id),
        })),
    };
  }, []);

  if (!data) {
    return (
      <main className="ap-page">
        <TopBar title="Progression" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  const maxSeconds = Math.max(...data.series.map((d) => d.seconds), 1);

  return (
    <main className="ap-page">
      <TopBar
        title="Progression"
        action={
          <Link to="/progress/calendar" className="ap-back" aria-label="Calendrier">
            <Icon name="calendar" size={19} />
          </Link>
        }
      />

      <div className="ap-stack">
        <section className="ap-card">
          <div className="ap-row ap-row--between">
            <div>
              <p className="ap-eyebrow">Niveau</p>
              <p className="ap-title-xl" style={{ fontSize: 27 }}>
                {data.level.level}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="ap-eyebrow">Expérience</p>
              <p className="ap-title-lg">{data.xp} XP</p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={data.level.percent} sunken label="Progression vers le niveau suivant" />
            <p className="ap-caption" style={{ marginTop: 6 }}>
              {data.level.xpIntoLevel} / {data.level.xpForNextLevel} XP vers le niveau {data.level.level + 1}
            </p>
          </div>
        </section>

        <div className="stat-grid">
          <StatCard label="Aujourd’hui" value={formatDuration(data.today)} icon="clock" />
          <StatCard label="Cette semaine" value={formatDuration(data.week)} icon="calendar" />
          <StatCard label="Ce mois" value={formatDuration(data.month)} icon="chart" />
          <StatCard label="Total" value={formatDuration(data.total)} icon="target" />
          <StatCard label="Leçons terminées" value={`${data.lessonsCompleted} / ${data.lessonsTotal}`} icon="check-circle" />
          <StatCard label="Cours terminés" value={`${data.coursesCompleted}`} icon="book" />
          <StatCard label="Taux de réussite" value={data.attemptCount === 0 ? '—' : `${data.successRate} %`} icon="trophy" />
          <StatCard label="Série / record" value={`${data.streak.current} / ${data.streak.best} j`} icon="flame" />
        </div>

        <Section title="Les 7 derniers jours" icon="chart">
          <div className="ap-card">
            <div className="spark">
              {data.series.map((entry) => (
                <div
                  key={entry.day}
                  className={`spark__bar ${entry.seconds > 0 ? 'spark__bar--met' : ''}`}
                  style={{ height: `${Math.max(4, (entry.seconds / maxSeconds) * 100)}%` }}
                  title={`${entry.day} · ${formatDuration(entry.seconds)}`}
                />
              ))}
            </div>
            <div className="spark__labels">
              {data.series.map((entry) => (
                <span key={entry.day}>{entry.day.slice(8)}</span>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Par domaine" icon="sparkle">
          <div className="ap-list">
            {data.domains.map(({ domain, seconds, progress }) => (
              <Link key={domain.id} to={`/courses/domain/${domain.id}`} className="ap-list-card">
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{domain.name}</span>
                  <span className="ap-caption">
                    {formatDuration(seconds)} · {progress.completed}/{progress.total} leçons
                  </span>
                  <span style={{ display: 'block', marginTop: 8 }}>
                    <ProgressBar value={progress.percent} sunken label={`Progression ${domain.name}`} />
                  </span>
                </span>
                <span style={{ fontWeight: 750, fontSize: 14 }}>{progress.percent} %</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section
          title="À renforcer"
          icon="target"
          action={
            <Link to="/progress/review" className="ap-section__link">
              À revoir <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          {data.weak.length === 0 ? (
            <EmptyState
              icon="check-circle"
              title="Rien a signaler"
              hint="Réponds a quelques quiz : les notions fragiles apparaitront ici."
            />
          ) : (
            <div className="ap-list">
              {data.weak.map((topic) => (
                <Link
                  key={topic.topic}
                  to={`/games/quiz?topic=${encodeURIComponent(topic.topic)}`}
                  className="ap-list-card weak-row"
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700 }}>{topic.topic}</span>
                    <span className="ap-caption">
                      {topic.correct}/{topic.attempts} bonnes réponses
                    </span>
                  </span>
                  <span style={{ fontWeight: 780, color: 'var(--ap-danger)' }}>{topic.successRate} %</span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Badges" icon="trophy">
          <div className="ap-grid-2">
            {BADGES.map((badge) => {
              const unlocked = data.badges.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className="stat-card"
                  style={{ opacity: unlocked ? 1 : 0.5, display: 'flex', gap: 10, alignItems: 'flex-start' }}
                >
                  <span style={{ fontSize: 22 }} aria-hidden="true">
                    {unlocked ? badge.icon : '🔒'}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 13.5 }}>{badge.label}</span>
                    <span className="ap-caption">{badge.description}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: Parameters<typeof Icon>[0]['name'] }) {
  return (
    <div className="stat-card">
      <span className="ap-row" style={{ gap: 7 }}>
        <Icon name={icon} size={16} style={{ color: 'var(--ap-violet-500)' }} />
        <span className="ap-caption">{label}</span>
      </span>
      <p className="stat-card__value">{value}</p>
    </div>
  );
}
