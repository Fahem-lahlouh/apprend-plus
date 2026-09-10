import { Link } from 'react-router-dom';
import { accentClass, Icon, Section } from '@/design-system';
import { GAMES } from '@/features/games/gameCatalog';
import './practice.css';

export function PracticeScreen() {
  return (
    <main className="ap-page">
      <div className="ap-header">
        <div>
          <h1 className="ap-title-xl">Pratique</h1>
          <p className="ap-caption" style={{ marginTop: 4 }}>
            Écris du code, teste-le, et révise en jouant.
          </p>
        </div>
      </div>

      <div className="ap-stack">
        <Section title="Écrire du code" icon="code">
          <div className="ap-list">
            <Link to="/practice/editor" className="ap-list-card">
              <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                <Icon name="code" size={18} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>Éditeur de code</span>
                <span className="ap-caption">Java, JavaScript, Python et SQL, avec coloration syntaxique.</span>
              </span>
              <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
            </Link>
            <Link to="/practice/resources" className="ap-list-card">
              <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-blue">
                <Icon name="globe" size={18} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700 }}>Ressources et documentation</span>
                <span className="ap-caption">Java, Spring, MDN, Stack Overflow…</span>
              </span>
              <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
            </Link>
          </div>
        </Section>

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
            {GAMES.map((game) => (
              <Link key={game.id} to={game.to} className={`ap-tile ${accentClass(game.accent)}`}>
                <span className="ap-icon-badge">
                  <Icon name={game.icon} size={21} />
                </span>
                <span style={{ fontWeight: 750, fontSize: 16.5 }}>{game.title}</span>
                <span className="ap-caption">{game.short}</span>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
