import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import type { IncidentBlock } from '@/models';
import { shuffle } from '@/utils/array';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import './games.css';

/**
 * Mode incident : raisonner comme en production.
 *
 * Les scénarios ne sont pas stockés à part — ils sont extraits des blocs
 * `incident` des leçons. Ajouter un incident à une leçon le rend jouable ici,
 * quel que soit le domaine, sans configuration.
 *
 * L'ordre de révélation est la méthode elle-même : on choisit d'abord par où
 * commencer, et la correction n'apparaît qu'après les hypothèses. On ne peut
 * donc pas apprendre à sauter directement au remède.
 */
interface Scenario {
  incident: IncidentBlock;
  lessonId: string;
  lessonTitle: string;
}

type Phase = 'triage' | 'collect' | 'hypotheses' | 'resolution';

export function IncidentScreen() {
  const toast = useToast();

  const scenarios = useLiveQuery(async () => {
    const lessons = await db.lessons.toArray();
    const found: Scenario[] = [];
    for (const lesson of lessons) {
      for (const block of lesson.blocks) {
        if (block.kind === 'incident') {
          found.push({ incident: block, lessonId: lesson.id, lessonTitle: lesson.title });
        }
      }
    }
    return found;
  }, []);

  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('triage');
  const [pick, setPick] = useState<string | null>(null);

  const queue = useMemo(() => {
    if (!scenarios || scenarios.length === 0) return [] as Scenario[];
    void seed;
    return shuffle(scenarios);
  }, [scenarios, seed]);

  useStudyTimer({ activity: 'game', enabled: queue.length > 0 });

  if (scenarios === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Mode incident" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Mode incident" />
        <EmptyState
          icon="bolt"
          title="Aucun incident disponible"
          hint="Les leçons contenant un scénario d’incident alimenteront ce mode."
        />
      </main>
    );
  }

  const restart = () => {
    setSeed((v) => v + 1);
    setIndex(0);
    setPhase('triage');
    setPick(null);
  };

  if (index >= queue.length) {
    return (
      <main className="ap-page">
        <TopBar title="Mode incident" />
        <section className="ap-card" style={{ textAlign: 'center', padding: 24 }}>
          <h2 className="ap-title-lg">Tous les incidents ont été traités</h2>
          <p className="ap-body" style={{ marginTop: 8 }}>
            {queue.length} scénario{queue.length > 1 ? 's' : ''} parcouru{queue.length > 1 ? 's' : ''}.
          </p>
          <Button block icon="refresh" style={{ marginTop: 18 }} onClick={restart}>
            Recommencer
          </Button>
        </section>
      </main>
    );
  }

  const { incident, lessonTitle } = queue[index];

  const next = () => {
    setIndex((v) => v + 1);
    setPhase('triage');
    setPick(null);
  };

  // Les pistes proposées au triage sont les vrais endroits où regarder, mêlés :
  // c'est le choix de l'ordre qui s'apprend, pas la reconnaissance d'un intrus.
  const triageOptions = incident.where;

  return (
    <main className="ap-page">
      <TopBar title="Mode incident" />

      <div className="ap-row" style={{ gap: 10, marginBottom: 16 }}>
        <ProgressBar value={(index / queue.length) * 100} sunken label="Avancement de la session" />
        <span className="ap-caption" style={{ whiteSpace: 'nowrap' }}>
          {index + 1}/{queue.length}
        </span>
      </div>

      <section className="incident-card" style={{ marginBottom: 16 }}>
        <p className="block-callout__label" style={{ color: 'var(--ap-red-ink)' }}>
          <Icon name="bolt" size={14} /> Symptôme
        </p>
        <p style={{ fontWeight: 750, fontSize: 15.5 }}>{incident.symptom}</p>
        <p className="ap-caption" style={{ marginTop: 8 }}>
          Leçon : {lessonTitle}
        </p>
      </section>

      {phase === 'triage' && (
        <section className="ap-card">
          <h2 className="ap-title-md" style={{ marginBottom: 4 }}>
            Quelle est ta première action ?
          </h2>
          <p className="ap-caption" style={{ marginBottom: 12 }}>
            Il n’y a pas une seule bonne réponse — mais il y a des endroits plus rentables que d’autres.
          </p>
          <div className="ap-list">
            {triageOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`ap-list-card incident-option ${pick === option ? 'incident-option--picked' : ''}`}
                onClick={() => setPick(option)}
              >
                <Icon
                  name={pick === option ? 'check-circle' : 'chevron-right'}
                  size={17}
                  style={{ color: pick === option ? 'var(--ap-green-ink)' : 'var(--ap-text-faint)' }}
                />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontSize: 14.5 }}>{option}</span>
              </button>
            ))}
          </div>
          <Button
            block
            style={{ marginTop: 14 }}
            disabled={pick === null}
            onClick={() => {
              setPhase('collect');
              toast('Bien. Maintenant, que faut-il récupérer ?');
            }}
          >
            Commencer par là
          </Button>
        </section>
      )}

      {phase === 'collect' && (
        <section className="ap-card">
          <h2 className="ap-title-md" style={{ marginBottom: 10 }}>
            Les informations à récupérer
          </h2>
          <ul className="incident-list">
            {incident.collect.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="ap-caption" style={{ marginTop: 12 }}>
            Aucune hypothèse tant que ces éléments ne sont pas réunis : c’est ce qui évite de corriger au hasard.
          </p>
          <Button block style={{ marginTop: 14 }} onClick={() => setPhase('hypotheses')}>
            Voir les hypothèses
          </Button>
        </section>
      )}

      {phase === 'hypotheses' && (
        <section className="ap-card">
          <h2 className="ap-title-md" style={{ marginBottom: 10 }}>
            Hypothèses, et comment trancher
          </h2>
          <ul className="incident-hypotheses">
            {incident.hypotheses.map((hypothesis) => (
              <li key={hypothesis.cause}>
                <span className="incident-hypotheses__cause">{hypothesis.cause}</span>
                <span className="incident-hypotheses__confirm">{hypothesis.confirm}</span>
              </li>
            ))}
          </ul>
          <Button block style={{ marginTop: 14 }} onClick={() => setPhase('resolution')}>
            Voir la correction
          </Button>
        </section>
      )}

      {phase === 'resolution' && (
        <>
          <section className="ap-card">
            <p className="block-callout__label">
              <Icon name="check" size={14} /> Correction
            </p>
            <p className="ap-body" style={{ color: 'var(--ap-text)', marginTop: 4 }}>
              {incident.fix}
            </p>
          </section>
          <section className="ap-card" style={{ marginTop: 12 }}>
            <p className="block-callout__label">
              <Icon name="check-circle" size={14} /> Comment valider
            </p>
            <p className="ap-body" style={{ color: 'var(--ap-text)', marginTop: 4 }}>
              {incident.validate}
            </p>
          </section>
          <Button block icon="chevron-right" style={{ marginTop: 16 }} onClick={next}>
            {index === queue.length - 1 ? 'Terminer' : 'Incident suivant'}
          </Button>
        </>
      )}
    </main>
  );
}
