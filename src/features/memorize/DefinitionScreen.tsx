import { Link, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { EmptyState, Icon, ProgressBar, Section } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { definitionRepository } from '@/repositories/definitionRepository';
import { analyzeDefinition } from '@/services/textAnalysis';
import { MAX_LEVEL, availableGames } from '@/services/memorizationEngine';
import { hardestTargets, loadProgress } from '@/services/memorizationProgress';
import './memorize.css';

export function DefinitionScreen() {
  const { definitionId = '' } = useParams();

  const data = useLiveQuery(async () => {
    const definition = await definitionRepository.get(definitionId);
    if (!definition) return null;
    const [progress, hardest] = await Promise.all([
      loadProgress(definitionId),
      hardestTargets(definitionId),
    ]);
    const analysis = analyzeDefinition(definition.text);
    return {
      definition,
      progress,
      hardest,
      analysis,
      games: availableGames(analysis, progress.level),
      locked: availableGames(analysis, MAX_LEVEL).length - availableGames(analysis, progress.level).length,
    };
  }, [definitionId]);

  if (data === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Définition" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }
  if (data === null) {
    return (
      <main className="ap-page">
        <TopBar title="Définition" />
        <EmptyState icon="note" title="Définition introuvable" />
      </main>
    );
  }

  const { definition, progress, analysis, games } = data;
  const successRate =
    progress.attempts === 0 ? 0 : Math.round((progress.correct / progress.attempts) * 100);

  return (
    <main className="ap-page">
      <TopBar
        title={definition.title}
        action={
          <Link to={`/memorize/${definition.id}/edit`} className="ap-back" aria-label="Modifier">
            <Icon name="pencil" size={19} />
          </Link>
        }
      />

      <section className="ap-card" style={{ marginBottom: 20 }}>
        <p className="ap-body" style={{ color: 'var(--ap-text)' }}>
          {definition.text}
        </p>
        <div className="ap-row" style={{ gap: 10, marginTop: 14 }}>
          <ProgressBar value={(progress.level / MAX_LEVEL) * 100} sunken label="Niveau de maîtrise" />
          <span className="memo-level">Niv. {progress.level}/{MAX_LEVEL}</span>
        </div>
        <p className="ap-caption" style={{ marginTop: 6 }}>
          {analysis.sentences.length} phrase{analysis.sentences.length > 1 ? 's' : ''} ·{' '}
          {analysis.wordCount} mots
          {progress.attempts > 0 && ` · ${successRate} % de réussite sur ${progress.attempts} exercices`}
        </p>
      </section>

      <Link
        to={`/memorize/${definition.id}/play`}
        className="ap-btn ap-btn--primary ap-btn--block"
        style={{ marginBottom: 12 }}
      >
        <Icon name="play" size={18} /> Mémoriser
      </Link>
      <Link
        to={`/games/timed?definitionId=${definition.id}`}
        className="ap-btn ap-btn--secondary ap-btn--block"
        style={{ marginBottom: 20 }}
      >
        <Icon name="clock" size={18} /> Mot manquant chronométré
      </Link>

      {data.hardest.length > 0 && (
        <Section title="Ce qui bloque" icon="target">
          <div className="ap-card">
            <p className="ap-caption" style={{ marginBottom: 10 }}>
              Les prochains exercices insisteront davantage sur ces mots.
            </p>
            <div className="ap-chip-row">
              {data.hardest.map((stat) => (
                <span key={stat.id} className="ap-chip" style={{ background: 'var(--ap-red-tint)', color: 'var(--ap-red-ink)' }}>
                  {stat.key} · {stat.errors}/{stat.attempts}
                </span>
              ))}
            </div>
          </div>
        </Section>
      )}

      <Section title={`${games.length} jeux disponibles`} icon="gamepad">
        <div className="ap-list">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/memorize/${definition.id}/play?kind=${game.id}`}
              className="ap-list-card"
            >
              <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                <Icon name={game.icon} size={17} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 650, fontSize: 14.5 }}>{game.label}</span>
                <span className="ap-caption">{game.description}</span>
              </span>
              <Icon name="chevron-right" size={17} style={{ color: 'var(--ap-text-faint)' }} />
            </Link>
          ))}
        </div>
        {data.locked > 0 && (
          <p className="ap-caption" style={{ marginTop: 10 }}>
            <Icon name="lock" size={13} /> {data.locked} jeu{data.locked > 1 ? 'x' : ''} de plus se
            débloque{data.locked > 1 ? 'nt' : ''} en montant de niveau.
          </p>
        )}
      </Section>
    </main>
  );
}
