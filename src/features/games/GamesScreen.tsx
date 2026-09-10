import { Link } from 'react-router-dom';
import { accentClass, Icon } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { GAMES } from './gameCatalog';
import './games.css';

export function GamesScreen() {
  return (
    <main className="ap-page">
      <TopBar title="Mini-jeux de révision" />
      <p className="ap-body" style={{ marginBottom: 18 }}>
        Chaque jeu utilisé tes vraies questions et flashcards : ce que tu reussis ou rates ici alimente ta
        progression et tes points à renforcer.
      </p>
      <div className="ap-stack ap-stack--tight">
        {GAMES.map((game) => (
          <Link key={game.id} to={game.to} className={`ap-tile ${accentClass(game.accent)}`}>
            <div className="ap-row" style={{ alignItems: 'flex-start' }}>
              <span className="ap-icon-badge">
                <Icon name={game.icon} size={21} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 750, fontSize: 16.5 }}>{game.title}</span>
                <span className="ap-caption" style={{ display: 'block', marginTop: 3 }}>
                  {game.description}
                </span>
              </span>
              <Icon name="chevron-right" size={18} style={{ color: 'var(--accent-ink)' }} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
