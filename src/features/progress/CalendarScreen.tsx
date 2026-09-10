import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Icon } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { formatDuration, monthLabel, toDayKey } from '@/utils/date';
import { computeStreak } from '@/services/streak';
import './progress.css';

const WEEK_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export function CalendarScreen() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const stats = useLiveQuery(() => db.dayStats.toArray(), []);

  if (!stats) {
    return (
      <main className="ap-page">
        <TopBar title="Calendrier" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  const byDay = new Map(stats.map((s) => [s.day, s]));
  const firstDay = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const leading = (firstDay.getDay() + 6) % 7; // Monday-first
  const today = toDayKey();
  const streak = computeStreak(stats);

  const monthSeconds = stats
    .filter((s) => s.day.startsWith(`${cursor.year}-${`${cursor.month + 1}`.padStart(2, '0')}`))
    .reduce((sum, s) => sum + s.seconds, 0);
  const monthGoalDays = stats.filter(
    (s) => s.goalMet && s.day.startsWith(`${cursor.year}-${`${cursor.month + 1}`.padStart(2, '0')}`),
  ).length;

  const shift = (delta: number) => {
    const date = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: date.getFullYear(), month: date.getMonth() });
  };

  return (
    <main className="ap-page">
      <TopBar title="Calendrier" />

      <div className="ap-card">
        <div className="ap-row ap-row--between" style={{ marginBottom: 14 }}>
          <button type="button" className="ap-back" aria-label="Mois précédent" onClick={() => shift(-1)}>
            <Icon name="chevron-left" size={18} />
          </button>
          <p className="ap-title-md">{monthLabel(cursor.year, cursor.month)}</p>
          <button type="button" className="ap-back" aria-label="Mois suivant" onClick={() => shift(1)}>
            <Icon name="chevron-right" size={18} />
          </button>
        </div>

        <div className="cal-grid" style={{ marginBottom: 8 }}>
          {WEEK_LABELS.map((label, index) => (
            <span key={index} className="ap-caption" style={{ textAlign: 'center' }}>
              {label}
            </span>
          ))}
        </div>

        <div className="cal-grid">
          {Array.from({ length: leading }).map((_, index) => (
            <span key={`empty-${index}`} className="cal-cell cal-cell--empty" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = toDayKey(new Date(cursor.year, cursor.month, index + 1));
            const stat = byDay.get(day);
            const className = stat?.goalMet
              ? 'cal-cell cal-cell--met'
              : stat && stat.seconds > 0
                ? 'cal-cell cal-cell--studied'
                : 'cal-cell';
            return (
              <span
                key={day}
                className={`${className} ${day === today ? 'cal-cell--today' : ''}`}
                title={stat ? `${formatDuration(stat.seconds)}${stat.goalMet ? ' · objectif atteint' : ''}` : 'Aucune session'}
              >
                {index + 1}
              </span>
            );
          })}
        </div>
      </div>

      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <span className="ap-caption">Temps ce mois-ci</span>
          <p className="stat-card__value">{formatDuration(monthSeconds)}</p>
        </div>
        <div className="stat-card">
          <span className="ap-caption">Objectifs atteints</span>
          <p className="stat-card__value">{monthGoalDays} j</p>
        </div>
        <div className="stat-card">
          <span className="ap-caption">Série actuelle</span>
          <p className="stat-card__value">{streak.current} j</p>
        </div>
        <div className="stat-card">
          <span className="ap-caption">Meilleure série</span>
          <p className="stat-card__value">{streak.best} j</p>
        </div>
      </div>

      <div className="ap-row" style={{ gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
        <span className="ap-row" style={{ gap: 6 }}>
          <span className="cal-cell cal-cell--met" style={{ width: 18, height: 18, aspectRatio: 'auto' }} />
          <span className="ap-caption">Objectif atteint</span>
        </span>
        <span className="ap-row" style={{ gap: 6 }}>
          <span className="cal-cell cal-cell--studied" style={{ width: 18, height: 18, aspectRatio: 'auto' }} />
          <span className="ap-caption">Session partielle</span>
        </span>
      </div>
    </main>
  );
}
