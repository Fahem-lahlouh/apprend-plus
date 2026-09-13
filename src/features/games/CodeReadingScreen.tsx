import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, ProgressBar } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import type { QuizQuestion } from '@/models';
import { shuffle } from '@/utils/array';
import { recordAttempt } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { QuestionCard } from './QuestionCard';
import './games.css';

/**
 * Types de questions qui portent un extrait de code à interpréter.
 *
 * La sélection se fait sur le type et non sur un tag : toute question
 * `code_output` ou `find_bug` ajoutée à n'importe quel domaine apparaît ici sans
 * qu'une ligne de code ne change.
 */
const CODE_TYPES = new Set<QuizQuestion['type']>(['code_output', 'find_bug']);

export function CodeReadingScreen() {
  const pool = useLiveQuery(async () => {
    const all = await db.questions.toArray();
    return all.filter((q) => CODE_TYPES.has(q.type) && q.code !== undefined);
  }, []);

  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const queue = useMemo(() => {
    if (!pool || pool.length === 0) return [] as QuizQuestion[];
    void seed;
    return shuffle(pool);
  }, [pool, seed]);

  useStudyTimer({ activity: 'game', enabled: queue.length > 0 });

  if (pool === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Que fait ce code ?" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Que fait ce code ?" />
        <EmptyState
          icon="code"
          title="Aucune question de code"
          hint="Les questions portant un extrait de code apparaîtront ici."
        />
      </main>
    );
  }

  const restart = () => {
    setSeed((v) => v + 1);
    setIndex(0);
    setCorrect(0);
  };

  if (index >= queue.length) {
    return (
      <main className="ap-page">
        <TopBar title="Que fait ce code ?" />
        <section className="ap-card" style={{ textAlign: 'center', padding: 24 }}>
          <h2 className="ap-title-lg">Session terminée</h2>
          <p className="ap-body" style={{ marginTop: 8 }}>
            {correct} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} sur {queue.length}.
          </p>
          <Button block icon="refresh" style={{ marginTop: 18 }} onClick={restart}>
            Recommencer
          </Button>
        </section>
      </main>
    );
  }

  const question = queue[index];

  return (
    <main className="ap-page">
      <TopBar title="Que fait ce code ?" />

      <div className="ap-row" style={{ gap: 10, marginBottom: 16 }}>
        <ProgressBar value={(index / queue.length) * 100} sunken label="Avancement de la session" />
        <span className="ap-caption" style={{ whiteSpace: 'nowrap' }}>
          {index + 1}/{queue.length}
        </span>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        onAnswered={(ok) => {
          if (ok) setCorrect((v) => v + 1);
          void recordAttempt(question, ok, 'game');
        }}
        onNext={() => setIndex((v) => v + 1)}
        nextLabel={index === queue.length - 1 ? 'Terminer' : 'Suivant'}
      />
    </main>
  );
}
