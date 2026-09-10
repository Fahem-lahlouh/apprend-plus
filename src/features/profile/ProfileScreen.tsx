import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Icon, ProgressBar, Section } from '@/design-system';
import { db } from '@/repositories/db';
import { computeStreak } from '@/services/streak';
import { countCompletedCourses } from '@/services/progression';
import { BADGES, levelProgress } from '@/services/gamification';
import { usePreferences } from '@/hooks/usePreferences';
import { DEFAULT_PREFERENCES } from '@/repositories/settingsRepository';
import { formatDuration } from '@/utils/date';
import type { ThemeMode } from '@/models';
import '@/features/progress/progress.css';

const GOALS = [5, 10, 20, 30, 45, 60];
const THEMES: { value: ThemeMode; label: string; icon: 'sun' | 'moon' | 'sparkle' }[] = [
  { value: 'light', label: 'Clair', icon: 'sun' },
  { value: 'dark', label: 'Sombre', icon: 'moon' },
  { value: 'system', label: 'Système', icon: 'sparkle' },
];

export function ProfileScreen() {
  const { preferences, update } = usePreferences();

  const data = useLiveQuery(async () => {
    const [profile, progress, lessons, courses, sessions, stats, badges] = await Promise.all([
      db.profile.get('profile'),
      db.lessonProgress.toArray(),
      db.lessons.toArray(),
      db.courses.toArray(),
      db.sessions.toArray(),
      db.dayStats.toArray(),
      db.badges.toArray(),
    ]);
    return {
      level: levelProgress(profile?.xp ?? 0),
      xp: profile?.xp ?? 0,
      streak: computeStreak(stats),
      totalSeconds: sessions.reduce((sum, s) => sum + s.durationSec, 0),
      lessonsCompleted: progress.filter((p) => p.status === 'completed').length,
      coursesCompleted: countCompletedCourses(courses, lessons, progress),
      badges: badges.map((b) => b.id),
    };
  }, []);

  return (
    <main className="ap-page">
      <div className="ap-header">
        <div>
          <h1 className="ap-title-xl">Profil</h1>
          <p className="ap-caption" style={{ marginTop: 4 }}>
            Tes reglages et tes résultats.
          </p>
        </div>
        <Link to="/search" className="ap-icon-btn" aria-label="Rechercher">
          <Icon name="search" size={20} />
        </Link>
      </div>

      <div className="ap-stack">
        {data && (
          <>
            <section className="ap-card">
              <div className="ap-row ap-row--between">
                <div>
                  <p className="ap-eyebrow">Niveau {data.level.level}</p>
                  <p className="ap-title-xl" style={{ fontSize: 26 }}>
                    {data.xp} XP
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="ap-eyebrow">Série</p>
                  <p className="ap-title-lg" style={{ color: 'var(--ap-streak)' }}>
                    {data.streak.current} j
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={data.level.percent} sunken label="Progression du niveau" />
              </div>
            </section>

            <div className="stat-grid">
              <div className="stat-card">
                <span className="ap-caption">Temps total</span>
                <p className="stat-card__value">{formatDuration(data.totalSeconds)}</p>
              </div>
              <div className="stat-card">
                <span className="ap-caption">Leçons terminées</span>
                <p className="stat-card__value">{data.lessonsCompleted}</p>
              </div>
              <div className="stat-card">
                <span className="ap-caption">Cours terminés</span>
                <p className="stat-card__value">{data.coursesCompleted}</p>
              </div>
              <div className="stat-card">
                <span className="ap-caption">Badges</span>
                <p className="stat-card__value">
                  {data.badges.length}/{BADGES.length}
                </p>
              </div>
            </div>
          </>
        )}

        <Section title="Objectif quotidien" icon="target">
          <div className="ap-card">
            <div className="ap-chip-row">
              {GOALS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`ap-chip ${preferences.dailyGoalMinutes === minutes ? 'ap-chip--active' : ''}`}
                  aria-pressed={preferences.dailyGoalMinutes === minutes}
                  onClick={() => void update({ dailyGoalMinutes: minutes })}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <p className="ap-caption" style={{ marginTop: 10 }}>
              Le temps réalisé est calcule automatiquement à partir de tes sessions d’apprentissage.
            </p>
          </div>
        </Section>

        <Section title="Apparence" icon="sun">
          <div className="ap-card">
            <div className="ap-chip-row">
              {THEMES.map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  className={`ap-chip ${preferences.theme === theme.value ? 'ap-chip--active' : ''}`}
                  aria-pressed={preferences.theme === theme.value}
                  onClick={() => void update({ theme: theme.value })}
                >
                  <Icon name={theme.icon} size={15} /> {theme.label}
                </button>
              ))}
            </div>
            <div className="ap-row ap-row--between" style={{ marginTop: 14 }}>
              <span style={{ fontSize: 14.5, fontWeight: 650 }}>Réduire les animations</span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.reduceMotion}
                aria-label="Réduire les animations"
                className="ap-switch"
                onClick={() => void update({ reduceMotion: !preferences.reduceMotion })}
              />
            </div>
          </div>
        </Section>

        <Section title="Exécution de code" icon="code">
          <div className="ap-card">
            <label className="ap-field">
              <span className="ap-label">Service d’exécution (compatible Piston)</span>
              <input
                className="ap-input"
                value={preferences.codeRunnerEndpoint}
                onChange={(event) => void update({ codeRunnerEndpoint: event.target.value })}
                inputMode="url"
                spellCheck={false}
              />
            </label>
            <p className="ap-caption" style={{ marginTop: 8 }}>
              Java et Python sont compilés par un service Piston (open source, gratuit, sans clé). Tu peux pointer
              vers ta propre instance si l’instance publique est indisponible. JavaScript, lui, s’exécute toujours en
              local, hors ligne.
            </p>
            {preferences.codeRunnerEndpoint !== DEFAULT_PREFERENCES.codeRunnerEndpoint && (
              <Button
                variant="ghost"
                size="sm"
                block
                style={{ marginTop: 10 }}
                onClick={() => void update({ codeRunnerEndpoint: DEFAULT_PREFERENCES.codeRunnerEndpoint })}
              >
                Revenir au service par défaut
              </Button>
            )}
          </div>
        </Section>

        <Section title="Plus" icon="chart">
          <div className="ap-list">
            <ProfileLink to="/progress" icon="chart" label="Statistiques détaillées" />
            <ProfileLink to="/progress/calendar" icon="calendar" label="Calendrier" />
            <ProfileLink to="/progress/review" icon="rotate" label="À revoir" />
            <ProfileLink to="/profile/favorites" icon="star" label="Mes favoris" />
            <ProfileLink to="/reminders" icon="bell" label="Rappels et notifications" />
            <ProfileLink to="/profile/data" icon="download" label="Sauvegarde et données" />
          </div>
        </Section>

        <p className="ap-caption" style={{ textAlign: 'center' }}>
          Apprend+ · toutes tes données restent sur cet appareil.
        </p>
      </div>
    </main>
  );
}

function ProfileLink({ to, icon, label }: { to: string; icon: Parameters<typeof Icon>[0]['name']; label: string }) {
  return (
    <Link to={to} className="ap-list-card">
      <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
        <Icon name={icon} size={17} />
      </span>
      <span style={{ flex: 1, fontWeight: 650 }}>{label}</span>
      <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
    </Link>
  );
}
