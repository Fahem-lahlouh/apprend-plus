import { Link, useNavigate } from 'react-router-dom';
import { accentClass, EmptyState, Icon, ProgressBar, ProgressRing, Section } from '@/design-system';
import { Glyph } from '@/components/Glyph';
import { Mascot } from '@/components/Mascot';
import { useHomeData } from '@/hooks/useHomeData';
import { describeNextOccurrence, formatDuration } from '@/utils/date';
import { GAMES } from '@/features/games/gameCatalog';
import './home.css';

export function HomeScreen() {
  const data = useHomeData();
  const navigate = useNavigate();

  if (!data) {
    return (
      <main className="ap-page">
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  const { goal, streak } = data;
  const pendingReminders = data.reminders.length;

  return (
    <main className="ap-page">
      <header className="home-header">
        <div>
          <h1 className="home-brand">
            Apprend<span>+</span>
          </h1>
          <p className="home-tagline">Apprends l’informatique, l’anglais et bien plus 🚀</p>
        </div>
        <Link
          to="/reminders"
          className="ap-icon-btn"
          aria-label={`Rappels${pendingReminders > 0 ? ` (${pendingReminders} aujourd’hui)` : ''}`}
        >
          <Icon name="bell" size={21} />
          {pendingReminders > 0 && <span className="ap-dot" />}
        </Link>
      </header>

      <div className="ap-stack">
        {/* -------------------------- Objectif du jour ------------------------- */}
        <section className="home-goal">
          <p className="ap-eyebrow">Objectif du jour</p>
          <div className="home-goal__grid">
            <div>
              <p className="home-goal__value">
                {Math.round(goal.doneSeconds / 60)} min <small>/ {Math.round(goal.goalSeconds / 60)} min</small>
              </p>
              <div className="home-goal__bar">
                <ProgressBar value={goal.percent} label="Progression de l’objectif du jour" />
              </div>
            </div>
            <ProgressRing value={goal.percent} primary={`${goal.percent} %`} secondary="aujourd’hui" size={112} stroke={13} />
          </div>

          <div className="home-goal__bubble">
            {goal.percent >= 100
              ? 'Objectif atteint. Bravo !'
              : 'Un peu chaque jour de grands résultats !'}
          </div>
          <div className="home-goal__mascot">
            <Mascot size={96} />
          </div>

          <div className="home-streak">
            <span className="home-streak__flame">
              <Icon name="flame" size={20} />
            </span>
            <div>
              <p className="home-streak__title">
                Série : {streak.current} jour{streak.current > 1 ? 's' : ''}
              </p>
              <p className="ap-caption">
                {streak.current === 0
                  ? 'Atteins ton objectif pour lancer une série.'
                  : streak.atRisk
                    ? "Termine ton objectif aujourd’hui pour ne pas la perdre."
                    : 'Tu progresses chaque jour !'}
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------ Prochaine activité ------------------------- */}
        {data.recommendations.length > 0 && (
          <Section title="Ta prochaine activité" icon="sparkle">
            <div className="ap-stack ap-stack--tight">
              {data.recommendations.slice(0, 2).map((reco) => (
                <button
                  key={reco.id}
                  type="button"
                  className={`home-reco ${accentClass(reco.accent)}`}
                  onClick={() => navigate(reco.to)}
                >
                  <span className="ap-icon-badge ap-icon-badge--sm">
                    <Icon name={reco.icon} size={19} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span className="home-tile__title" style={{ display: 'block' }}>
                      {reco.title}
                    </span>
                    <span className="ap-caption" style={{ display: 'block', marginTop: 2 }}>
                      {reco.body}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        marginTop: 8,
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: 'var(--accent-ink)',
                      }}
                    >
                      {reco.cta}
                      <Icon name="chevron-right" size={15} />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* --------------------------- Domaines -------------------------------- */}
        <Section
          title="Domaines à apprendre"
          icon="book"
          action={
            <Link to="/courses" className="ap-section__link">
              Voir tous <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          {data.domains.length === 0 ? (
            <EmptyState icon="book" title="Aucun domaine" hint="Créé ton premier domaine depuis l’onglet Cours." />
          ) : (
            <div className="ap-grid-2">
              {data.domains.slice(0, 4).map(({ domain, progress }) => (
                <Link
                  key={domain.id}
                  to={`/courses/domain/${domain.id}`}
                  className={`ap-tile ${accentClass(domain.accent)}`}
                >
                  <span className="ap-icon-badge">
                    <Glyph value={domain.icon} size={22} />
                  </span>
                  <span className="home-tile__title">{domain.name}</span>
                  <span className="home-tile__desc">{domain.description}</span>
                  <span className="home-tile__meter">
                    <ProgressBar value={progress.percent} label={`Progression ${domain.name}`} />
                    <span className="home-tile__pct">{progress.percent} %</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {/* --------------------------- Pratique -------------------------------- */}
        <Section
          title="Pratique"
          icon="laptop"
          action={
            <Link to="/practice" className="ap-section__link">
              Voir tous <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          <div className="home-practice">
            <div className="home-practice__main">
              <div className="ap-row" style={{ alignItems: 'flex-start' }}>
                <span className="ap-icon-badge ap-accent-violet ap-icon-badge--plain">
                  <Icon name="code" size={21} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="home-tile__title" style={{ display: 'block' }}>
                    Compiler du code
                  </span>
                  <span className="ap-caption" style={{ display: 'block' }}>
                    Teste ton code avec l’éditeur intégré.
                  </span>
                </span>
              </div>
              <div className="home-code-preview" aria-hidden="true">
                <div className="home-code-preview__dots">
                  <span className="home-code-preview__dot" style={{ background: '#ff6058' }} />
                  <span className="home-code-preview__dot" style={{ background: '#ffbd2e' }} />
                  <span className="home-code-preview__dot" style={{ background: '#28ca42' }} />
                </div>
                <span className="home-code-preview__line" style={{ width: '70%', background: '#6c5ce7' }} />
                <span className="home-code-preview__line" style={{ width: '48%' }} />
                <span className="home-code-preview__line" style={{ width: '60%' }} />
                <span className="home-code-preview__line" style={{ width: '35%', background: '#2f8f6b' }} />
                <span className="home-code-preview__play">
                  <Icon name="play" size={14} />
                </span>
              </div>
              <Link to="/practice/editor" className="ap-btn ap-btn--primary ap-btn--block">
                Ouvrir l’éditeur <Icon name="chevron-right" size={17} />
              </Link>
            </div>

            <Link to="/practice/resources" className="home-practice__side">
              <span className="ap-icon-badge ap-icon-badge--sm" style={{ color: 'var(--ap-blue-ink)' }}>
                <Icon name="globe" size={19} />
              </span>
              <span className="home-tile__title">Ressources</span>
              <span className="ap-caption">Documentation officielle en un clic.</span>
              <span
                style={{
                  marginTop: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: 'var(--ap-blue-ink)',
                }}
              >
                Ouvrir <Icon name="chevron-right" size={15} />
              </span>
            </Link>
          </div>
        </Section>

        {/* --------------------------- Mini-jeux ------------------------------- */}
        <Section
          title="Mini-jeux de révision"
          icon="gamepad"
          action={
            <Link to="/games" className="ap-section__link">
              Voir tous <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          <div className="ap-grid-2">
            {GAMES.slice(0, 4).map((game) => (
              <Link key={game.id} to={game.to} className={`ap-tile ${accentClass(game.accent)}`}>
                <span className="ap-icon-badge">
                  <Icon name={game.icon} size={21} />
                </span>
                <span className="home-tile__title">{game.title}</span>
                <span className="ap-caption" style={{ paddingRight: 28 }}>
                  {game.short}
                </span>
                <span className="home-game__go">
                  <Icon name="chevron-right" size={15} />
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* ---------------------------- Rappels -------------------------------- */}
        <Section
          title="Tes rappels d’apprentissage"
          icon="calendar"
          action={
            <Link to="/reminders" className="ap-section__link">
              Tout voir <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          {data.reminders.length === 0 ? (
            <EmptyState
              icon="bell"
              title="Aucun rappel prévu aujourd’hui"
              hint="Créé un rappel pour garder le rythme."
            />
          ) : (
            <div className="ap-list">
              {data.reminders.slice(0, 3).map((reminder) => (
                <Link key={reminder.id} to="/reminders" className="ap-list-card home-reminder">
                  <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                    <Icon name="bell" size={17} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15 }}>{reminder.title}</span>
                    <span className="ap-caption" style={{ display: 'block' }}>
                      {reminder.subtitle ?? `${reminder.durationMin} min`}
                    </span>
                  </span>
                  <span className="home-reminder__time">
                    {describeNextOccurrence(reminder.days, reminder.time)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Link to="/progress" className="ap-list-card">
          <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-green">
            <Icon name="chart" size={18} />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 700 }}>Ta progression</span>
            <span className="ap-caption">
              Niveau {data.level.level} · {data.xp} XP · {formatDuration(goal.doneSeconds)} aujourd’hui
            </span>
          </span>
          <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
        </Link>
      </div>
    </main>
  );
}
