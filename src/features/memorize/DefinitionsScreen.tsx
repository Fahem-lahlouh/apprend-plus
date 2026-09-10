import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { EmptyState, Icon, ProgressBar, Section } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { analyzeDefinition } from '@/services/textAnalysis';
import { MAX_LEVEL, availableGames } from '@/services/memorizationEngine';
import './memorize.css';

export function DefinitionsScreen() {
  const rows = useLiveQuery(async () => {
    const [definitions, progress] = await Promise.all([
      db.definitions.toArray(),
      db.definitionProgress.toArray(),
    ]);
    const byId = new Map(progress.map((entry) => [entry.definitionId, entry]));
    return definitions
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((definition) => {
        const analysis = analyzeDefinition(definition.text);
        const level = byId.get(definition.id)?.level ?? 1;
        return {
          definition,
          level,
          games: availableGames(analysis, level).length,
          words: analysis.wordCount,
        };
      });
  }, []);

  return (
    <main className="ap-page">
      <TopBar
        title="Mes définitions"
        action={
          <Link to="/memorize/new" className="ap-back" aria-label="Nouvelle définition">
            <Icon name="plus" size={20} />
          </Link>
        }
      />

      <p className="ap-body" style={{ marginBottom: 18 }}>
        Écris une définition, elle devient aussitôt un parcours de mémorisation. Les exercices sont déduits
        du texte à chaque partie : aucun jeu n’est à configurer, et les nouveaux jeux s’appliqueront
        automatiquement à tout ce qui est déjà enregistré.
      </p>

      {!rows ? (
        <p className="ap-caption">Chargement…</p>
      ) : rows.length === 0 ? (
        <>
          <EmptyState
            icon="note"
            title="Aucune définition"
            hint="Crée ta première définition : Spring Boot, Docker, un point de grammaire…"
          />
          <Link to="/memorize/new" className="ap-btn ap-btn--primary ap-btn--block">
            <Icon name="plus" size={18} /> Nouvelle définition
          </Link>
        </>
      ) : (
        <Section title={`${rows.length} définition${rows.length > 1 ? 's' : ''}`} icon="note">
          <div className="ap-list">
            {rows.map(({ definition, level, games, words }) => (
              <Link key={definition.id} to={`/memorize/${definition.id}`} className="ap-list-card memo-def-card">
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="ap-row" style={{ gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 750, fontSize: 15.5 }}>{definition.title}</span>
                    <span className="memo-level">Niv. {level}</span>
                  </span>
                  <span className="ap-caption" style={{ display: 'block' }}>
                    {words} mots · {games} jeux disponibles
                  </span>
                  <span style={{ display: 'block', marginTop: 8 }}>
                    <ProgressBar
                      value={(level / MAX_LEVEL) * 100}
                      sunken
                      label={`Maîtrise de ${definition.title}`}
                    />
                  </span>
                </span>
                <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
              </Link>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
