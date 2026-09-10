import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import type { QuizQuestion } from '@/models';
import { shuffle } from '@/utils/array';
import { addToReview, awardPerfectQuiz, recordAttempt } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { QuestionCard } from './QuestionCard';
import './games.css';

const QUESTIONS_PER_ROUND = 5;

export function QuizGameScreen() {
  const [params] = useSearchParams();
  const topic = params.get('topic');
  const domainId = params.get('domainId');
  const courseId = params.get('courseId');
  const questionId = params.get('question');
  const toast = useToast();

  const pool = useLiveQuery(async () => {
    const all = await db.questions.toArray();
    if (questionId) return all.filter((q) => q.id === questionId);
    if (topic) return all.filter((q) => q.topic === topic);
    if (courseId) return all.filter((q) => q.courseId === courseId);
    if (domainId) return all.filter((q) => q.domainId === domainId);
    return all;
  }, [topic, domainId, courseId, questionId]);

  const [round, setRound] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<QuizQuestion[]>([]);
  const [finished, setFinished] = useState(false);

  useStudyTimer({ activity: 'quiz', domainId: domainId ?? undefined, courseId: courseId ?? undefined });

  useEffect(() => {
    if (!pool) return;
    setRound(shuffle(pool).slice(0, QUESTIONS_PER_ROUND));
    setIndex(0);
    setScore(0);
    setWrong([]);
    setFinished(false);
  }, [pool]);

  const current = round[index];
  const title = useMemo(() => (topic ? `Quiz · ${topic}` : 'Quiz'), [topic]);

  if (!pool) {
    return (
      <main className="ap-page">
        <TopBar title={title} />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (pool.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title={title} />
        <EmptyState icon="trophy" title="Aucune question disponible" hint="Ajouté des questions depuis l’onglet Cours." />
      </main>
    );
  }

  const handleAnswer = async (correct: boolean) => {
    if (!current) return;
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => [...w, current]);
    await recordAttempt(current, correct, 'game');
  };

  const next = async () => {
    if (index + 1 < round.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    if (score === round.length && round.length > 1) {
      await awardPerfectQuiz();
      toast('Quiz parfait · +20 XP', 'xp');
    }
  };

  if (finished) {
    const percent = Math.round((score / round.length) * 100);
    return (
      <main className="ap-page">
        <TopBar title={title} />
        <div className="quiz-card game-result">
          <p className="game-result__score">
            {score}/{round.length}
          </p>
          <p className="ap-body">{percent} % de bonnes réponses</p>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button
              block
              onClick={() => {
                setRound(shuffle(pool).slice(0, QUESTIONS_PER_ROUND));
                setIndex(0);
                setScore(0);
                setWrong([]);
                setFinished(false);
              }}
              icon="refresh"
            >
              Rejouer
            </Button>
            <Link to="/games" className="ap-btn ap-btn--ghost ap-btn--block">
              Retour aux jeux
            </Link>
          </div>
        </div>

        {wrong.length > 0 && (
          <section style={{ marginTop: 22 }}>
            <h2 className="ap-title-md" style={{ marginBottom: 10 }}>
              À revoir
            </h2>
            <div className="ap-list">
              {wrong.map((question) => (
                <div key={question.id} className="ap-list-card" style={{ alignItems: 'flex-start' }}>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 650, fontSize: 14.5 }}>{question.prompt}</span>
                    <span className="ap-caption" style={{ display: 'block', marginTop: 3 }}>
                      {question.explanation}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await addToReview('question', question.id, question.topic, 'Erreur en quiz');
                      toast('Ajouté à « À revoir »');
                    }}
                  >
                    <Icon name="rotate" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="ap-page">
      <TopBar title={title} />
      <div className="quiz-progress">
        <span className="quiz-progress__label">
          {index + 1} / {round.length}
        </span>
        <ProgressBar value={((index + (current ? 0 : 1)) / round.length) * 100} sunken label="Progression du quiz" />
        <span className="quiz-progress__label">{score} pts</span>
      </div>
      {current && (
        <QuestionCard
          key={current.id}
          question={current}
          onAnswered={handleAnswer}
          onNext={next}
          nextLabel={index + 1 < round.length ? 'Question suivante' : 'Voir le résultat'}
        />
      )}
    </main>
  );
}
