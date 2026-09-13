import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import type { FollowUp, QuizQuestion } from '@/models';
import { shuffle } from '@/utils/array';
import { recordAttempt } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import '@/features/courses/courses.css';
import './games.css';

/** Une relance, repliée par défaut pour qu'on puisse s'interroger dessus. */
function FollowUpRow({ followUp }: { followUp: FollowUp }) {
  const [open, setOpen] = useState(false);
  return (
    <button type="button" className="followup" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <span className="followup__head">
        <span className="followup__question">{followUp.question}</span>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={16} style={{ color: 'var(--ap-text-faint)' }} />
      </span>
      {open && <span className="followup__answer">{followUp.answer}</span>}
    </button>
  );
}

/** Le tag qui rend une question éligible au mode entretien, quel que soit son domaine. */
export const INTERVIEW_TAG = 'entretien';

/**
 * Mode entretien : question ouverte, réflexion, puis auto-évaluation.
 *
 * L'écran ne connaît aucun sujet. Il sélectionne sur le tag `entretien` : ajouter
 * des questions à un autre domaine les fait apparaître ici sans toucher au code.
 */
export function InterviewScreen() {
  const toast = useToast();
  const pool = useLiveQuery(async () => {
    const all = await db.questions.toArray();
    return all.filter((q) => q.tags.includes(INTERVIEW_TAG));
  }, []);

  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [draft, setDraft] = useState('');
  const [known, setKnown] = useState(0);

  const queue = useMemo(() => {
    if (!pool || pool.length === 0) return [] as QuizQuestion[];
    void seed;
    return shuffle(pool);
  }, [pool, seed]);

  useStudyTimer({ activity: 'quiz', enabled: queue.length > 0 });

  if (pool === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Mode entretien" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Mode entretien" />
        <EmptyState
          icon="chat"
          title="Aucune question d’entretien"
          hint="Les questions marquées « entretien » apparaîtront ici."
        />
      </main>
    );
  }

  const finished = index >= queue.length;

  if (finished) {
    return (
      <main className="ap-page">
        <TopBar title="Mode entretien" />
        <section className="ap-card" style={{ textAlign: 'center', padding: 24 }}>
          <h2 className="ap-title-lg">Session terminée</h2>
          <p className="ap-body" style={{ marginTop: 8 }}>
            {known} réponse{known > 1 ? 's' : ''} maîtrisée{known > 1 ? 's' : ''} sur {queue.length}.
          </p>
          <Button
            block
            icon="refresh"
            style={{ marginTop: 18 }}
            onClick={() => {
              setSeed((v) => v + 1);
              setIndex(0);
              setKnown(0);
              setRevealed(false);
              setDraft('');
            }}
          >
            Recommencer
          </Button>
        </section>
      </main>
    );
  }

  const question = queue[index];

  const answer = async (mastered: boolean) => {
    await recordAttempt(question, mastered, 'quiz');
    if (mastered) setKnown((v) => v + 1);
    else toast('Ajoutée à tes points faibles');
    setIndex((v) => v + 1);
    setRevealed(false);
    setDraft('');
  };

  return (
    <main className="ap-page">
      <TopBar title="Mode entretien" />

      <div className="ap-row" style={{ gap: 10, marginBottom: 16 }}>
        <ProgressBar value={(index / queue.length) * 100} sunken label="Avancement de la session" />
        <span className="ap-caption" style={{ whiteSpace: 'nowrap' }}>
          {index + 1}/{queue.length}
        </span>
      </div>

      <section className="ap-card">
        <p className="ap-chip" style={{ marginBottom: 10 }}>
          {question.topic}
        </p>
        <h2 className="ap-title-md" style={{ lineHeight: 1.4 }}>
          {question.prompt}
        </h2>

        <textarea
          className="ap-textarea"
          style={{ marginTop: 14 }}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Réponds à voix haute ou écris ici, puis compare…"
          aria-label="Ta réponse"
        />

        {revealed ? (
          <>
            {question.shortAnswer && (
              <div className="interview-answer" style={{ marginTop: 14 }}>
                <p className="interview-answer__tag">Réponse courte · 20 à 30 secondes</p>
                <p>{question.shortAnswer}</p>
              </div>
            )}
            <div className="block-callout block-keypoints" style={{ marginTop: 12 }}>
              <p className="block-callout__label">
                <Icon name="sparkle" size={14} />{' '}
                {question.shortAnswer ? 'Réponse détaillée · 1 à 2 minutes' : 'Réponse attendue'}
              </p>
              <p>{question.answer}</p>
            </div>

            {question.followUps && question.followUps.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p className="interview-answer__tag" style={{ marginBottom: 8 }}>
                  Les relances qui suivent
                </p>
                <div className="ap-list">
                  {question.followUps.map((followUp) => (
                    <FollowUpRow key={followUp.question} followUp={followUp} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <Button block variant="secondary" style={{ marginTop: 14 }} onClick={() => setRevealed(true)}>
            Voir la réponse attendue
          </Button>
        )}
      </section>

      {revealed && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <Button block variant="ghost" icon="rotate" onClick={() => void answer(false)}>
            À revoir
          </Button>
          <Button block icon="check" onClick={() => void answer(true)}>
            Je savais
          </Button>
        </div>
      )}
    </main>
  );
}
