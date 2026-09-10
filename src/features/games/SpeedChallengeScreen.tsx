import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import type { QuizQuestion } from '@/models';
import { shuffle } from '@/utils/array';
import { awardGameCompleted, recordAttempt } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { QuestionCard } from './QuestionCard';
import './games.css';

const DURATION_SEC = 180;

export function SpeedChallengeScreen() {
  const questions = useLiveQuery(() => db.questions.toArray(), []);
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_SEC);
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useStudyTimer({ activity: 'game' });

  useEffect(() => {
    if (!running) return undefined;
    timerRef.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (running || remaining > 0 || answered === 0) return;
    void awardGameCompleted().then(() => toast(`Défi termine · ${score} bonnes réponses`, 'xp'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, remaining]);

  if (!questions) {
    return (
      <main className="ap-page">
        <TopBar title="Défi rapide" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Défi rapide" />
        <EmptyState icon="bolt" title="Aucune question disponible" />
      </main>
    );
  }

  const start = () => {
    setQueue(shuffle(questions));
    setIndex(0);
    setScore(0);
    setAnswered(0);
    setRemaining(DURATION_SEC);
    setRunning(true);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = `${remaining % 60}`.padStart(2, '0');

  if (!running && remaining === DURATION_SEC) {
    return (
      <main className="ap-page">
        <TopBar title="Défi rapide" />
        <div className="quiz-card game-result">
          <p className="ap-title-lg">3 minutes, un maximum de bonnes réponses</p>
          <p className="ap-body" style={{ marginTop: 8 }}>
            Les questions s’enchaînent sans explication. Le détail des erreurs reste consultable dans ta progression.
          </p>
          <Button block icon="bolt" style={{ marginTop: 18 }} onClick={start}>
            Démarrer
          </Button>
        </div>
      </main>
    );
  }

  if (!running) {
    return (
      <main className="ap-page">
        <TopBar title="Défi rapide" />
        <div className="quiz-card game-result">
          <p className="game-result__score">{score}</p>
          <p className="ap-body">
            bonnes réponses sur {answered} en 3 minutes
          </p>
          <Button block icon="refresh" style={{ marginTop: 18 }} onClick={start}>
            Recommencer
          </Button>
        </div>
      </main>
    );
  }

  const current = queue[index % queue.length];

  return (
    <main className="ap-page">
      <TopBar title="Défi rapide" />
      <div className="quiz-progress">
        <span className={`défi-timer ${remaining <= 30 ? 'défi-timer--low' : ''}`}>
          {minutes}:{seconds}
        </span>
        <ProgressBar value={(remaining / DURATION_SEC) * 100} sunken label="Temps restant" />
        <span className="quiz-progress__label">{score} pts</span>
      </div>
      <QuestionCard
        key={`${current.id}-${index}`}
        question={current}
        instantMode
        onAnswered={async (correct) => {
          setAnswered((a) => a + 1);
          if (correct) setScore((s) => s + 1);
          await recordAttempt(current, correct, 'game');
          setTimeout(() => setIndex((i) => i + 1), 550);
        }}
      />
    </main>
  );
}
