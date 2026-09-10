import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { definitionRepository } from '@/repositories/definitionRepository';
import type { Definition, MemoExercise, TimedMode } from '@/models';
import { generateExercise } from '@/services/memorizationEngine';
import {
  EMPTY_TIMED_STATS,
  TIMED_MODES,
  adaptTimedLevel,
  applyTimedAnswer,
  buildLeaderboard,
  loadWeakness,
  recordExerciseResult,
  saveTimedRun,
  timedScore,
  timedTier,
  type TimedSessionStats,
} from '@/services/memorizationProgress';
import { awardGameCompleted } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { ExerciseView } from '@/features/memorize/ExerciseView';
import '@/features/memorize/memorize.css';

const INFINITE_MAX_ERRORS = 3;

interface Question {
  exercise: MemoExercise;
  definition: Definition;
}

/**
 * Mot manquant chronométré.
 *
 * Aucune phrase n'est écrite ici : les questions viennent du MemorizationEngine,
 * donc le jeu fonctionne sur toutes les définitions, celles d'hier comme celles
 * de demain. Le palier fixe le temps, le niveau fixe la forme du trou, et les
 * deux suivent les performances.
 */
export function TimedMissingWordScreen() {
  const [params] = useSearchParams();
  const definitionId = params.get('definitionId') ?? undefined;
  const toast = useToast();

  const definitions = useLiveQuery(
    async () => (definitionId ? [await definitionRepository.get(definitionId)].filter(Boolean) as Definition[] : definitionRepository.list()),
    [definitionId],
  );
  const runs = useLiveQuery(() => db.timedRuns.toArray(), []);

  const [mode, setMode] = useState<TimedMode | null>(null);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<TimedSessionStats>(EMPTY_TIMED_STATS);
  const [remainingMs, setRemainingMs] = useState(0);
  const [sessionEndsAt, setSessionEndsAt] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ correct: boolean; expected: string; given: string; ms: number } | null>(null);
  const [finished, setFinished] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const askedAt = useRef(0);
  const requeue = useRef<Question[]>([]);
  const answeredRef = useRef(false);

  useStudyTimer({ activity: 'game', enabled: mode !== null });

  const targetCount = mode === 'fixed10' ? 10 : mode === 'fixed20' ? 20 : Infinity;

  const draw = useCallback(
    async (currentLevel: number): Promise<Question | null> => {
      // Une erreur remet le mot dans la file : il revient plus tard dans la session.
      const pending = requeue.current.shift();
      if (pending) return pending;

      const pool = (definitions ?? []).filter((definition) => definition.text.trim().length > 0);
      if (pool.length === 0) return null;
      const definition = pool[Math.floor(Math.random() * pool.length)];
      const tier = timedTier(currentLevel);
      const weakness = await loadWeakness(definition.id);
      const exercise = generateExercise(definition, {
        kind: 'timed_missing_word',
        level: tier.offerChoices ? Math.min(6, currentLevel) : currentLevel,
        weakness,
        timeLimitMs: tier.timeLimitMs,
      });
      return exercise ? { exercise, definition } : null;
    },
    [definitions],
  );

  const nextQuestion = useCallback(
    async (currentLevel: number) => {
      const next = await draw(currentLevel);
      if (!next) {
        setFinished(true);
        return;
      }
      answeredRef.current = false;
      setLastResult(null);
      setQuestion(next);
      setRemainingMs(next.exercise.timeLimitMs ?? 5000);
      askedAt.current = Date.now();
    },
    [draw],
  );

  const settle = useCallback(
    async (correct: boolean, given: string) => {
      if (answeredRef.current || !question) return;
      answeredRef.current = true;

      const elapsedMs = Math.min(Date.now() - askedAt.current, question.exercise.timeLimitMs ?? 5000);
      const nextStats = applyTimedAnswer(stats, { correct, elapsedMs });
      const nextLevel = adaptTimedLevel(level, { correct, elapsedMs });
      const expected = (question.exercise.body as { blanks: { answer: string }[] }).blanks
        .map((blank) => blank.answer)
        .join(' ');

      setStats(nextStats);
      setLevel(nextLevel);
      setLastResult({ correct, expected, given, ms: elapsedMs });
      await recordExerciseResult(question.exercise, correct);

      if (!correct) {
        requeue.current.push(question);
        setConsecutiveErrors((value) => value + 1);
      } else {
        setConsecutiveErrors(0);
      }

      const reachedCount = nextStats.answered >= targetCount;
      const tooManyErrors = mode === 'infinite' && !correct && consecutiveErrors + 1 >= INFINITE_MAX_ERRORS;
      if (reachedCount || tooManyErrors) {
        setTimeout(() => setFinished(true), 1400);
      } else {
        setTimeout(() => void nextQuestion(nextLevel), 1400);
      }
    },
    [question, stats, level, targetCount, mode, consecutiveErrors, nextQuestion],
  );

  // Chronomètre de la question : l'expiration compte comme une erreur.
  useEffect(() => {
    if (!question || finished || answeredRef.current) return undefined;
    const limit = question.exercise.timeLimitMs ?? 5000;
    const tick = setInterval(() => {
      const left = limit - (Date.now() - askedAt.current);
      setRemainingMs(Math.max(0, left));
      if (left <= 0) void settle(false, '');
    }, 100);
    return () => clearInterval(tick);
  }, [question, finished, settle]);

  // Chronomètre global des modes sprint.
  useEffect(() => {
    if (!sessionEndsAt || finished) return undefined;
    const tick = setInterval(() => {
      if (Date.now() >= sessionEndsAt) setFinished(true);
    }, 200);
    return () => clearInterval(tick);
  }, [sessionEndsAt, finished]);

  useEffect(() => {
    if (!finished || stats.answered === 0) return;
    void (async () => {
      const run = await saveTimedRun({ mode: mode ?? 'fixed10', definitionId, stats });
      await awardGameCompleted();
      toast(`${run.score} points · ${stats.correct} bonnes réponses`, 'xp');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const start = async (selected: TimedMode) => {
    setMode(selected);
    setStats(EMPTY_TIMED_STATS);
    setFinished(false);
    setConsecutiveErrors(0);
    requeue.current = [];
    setSessionEndsAt(
      selected === 'sprint60' ? Date.now() + 60_000 : selected === 'sprint180' ? Date.now() + 180_000 : null,
    );
    await nextQuestion(level);
  };

  const board = buildLeaderboard(runs ?? []);

  /* ------------------------------- Écrans ------------------------------- */

  if (definitions && definitions.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Mot manquant chronométré" />
        <EmptyState
          icon="clock"
          title="Aucune définition à travailler"
          hint="Crée une définition : le jeu s’y appliquera automatiquement."
        />
      </main>
    );
  }

  if (!mode) {
    return (
      <main className="ap-page">
        <TopBar title="Mot manquant chronométré" />
        <p className="ap-body" style={{ marginBottom: 18 }}>
          Un mot manque, le chrono tourne. Les questions sont tirées de tes définitions, et la difficulté
          suit tes performances : plus tu réponds vite et juste, moins tu as de temps et d’aide.
        </p>

        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <span className="ap-caption">Record du jour</span>
            <p className="stat-card__value">{board.todayBest}</p>
          </div>
          <div className="stat-card">
            <span className="ap-caption">Meilleur score</span>
            <p className="stat-card__value">{board.allTimeBest}</p>
          </div>
          <div className="stat-card">
            <span className="ap-caption">Meilleure série</span>
            <p className="stat-card__value">{board.bestStreak}</p>
          </div>
          <div className="stat-card">
            <span className="ap-caption">Meilleur temps</span>
            <p className="stat-card__value">{board.bestMs > 0 ? `${(board.bestMs / 1000).toFixed(1)} s` : '—'}</p>
          </div>
        </div>

        <div className="ap-list">
          {TIMED_MODES.map((entry) => (
            <button key={entry.id} type="button" className="ap-list-card" onClick={() => void start(entry.id)}>
              <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-amber">
                <Icon name="bolt" size={17} />
              </span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <span style={{ display: 'block', fontWeight: 700 }}>{entry.label}</span>
                <span className="ap-caption">{entry.hint}</span>
              </span>
              <Icon name="chevron-right" size={17} style={{ color: 'var(--ap-text-faint)' }} />
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (finished) {
    const average = stats.answered === 0 ? 0 : stats.totalMs / stats.answered;
    return (
      <main className="ap-page">
        <TopBar title="Mot manquant chronométré" />
        <div className="quiz-card game-result">
          <p className="game-result__score">{timedScore(stats)}</p>
          <p className="ap-body">points</p>
          <div className="stat-grid" style={{ marginTop: 20, textAlign: 'left' }}>
            <div className="stat-card">
              <span className="ap-caption">Bonnes réponses</span>
              <p className="stat-card__value">{stats.correct}/{stats.answered}</p>
            </div>
            <div className="stat-card">
              <span className="ap-caption">Taux de réussite</span>
              <p className="stat-card__value">
                {stats.answered === 0 ? 0 : Math.round((stats.correct / stats.answered) * 100)} %
              </p>
            </div>
            <div className="stat-card">
              <span className="ap-caption">Temps moyen</span>
              <p className="stat-card__value">{(average / 1000).toFixed(1)} s</p>
            </div>
            <div className="stat-card">
              <span className="ap-caption">Meilleur temps</span>
              <p className="stat-card__value">
                {Number.isFinite(stats.bestMs) ? `${(stats.bestMs / 1000).toFixed(1)} s` : '—'}
              </p>
            </div>
          </div>
          <p className="ap-caption" style={{ marginTop: 14 }}>
            Meilleure série : {stats.bestStreak} · palier atteint : {timedTier(level).name}
          </p>
          <Button block icon="refresh" style={{ marginTop: 18 }} onClick={() => setMode(null)}>
            Rejouer
          </Button>
        </div>
      </main>
    );
  }

  const limit = question?.exercise.timeLimitMs ?? 5000;
  const ratio = (remainingMs / limit) * 100;
  const low = remainingMs <= limit * 0.3;

  return (
    <main className="ap-page">
      <TopBar title="Mot manquant chronométré" />

      <div className="ap-row ap-row--between" style={{ marginBottom: 4 }}>
        <span className="ap-caption">
          Question {stats.answered + 1}
          {Number.isFinite(targetCount) ? ` / ${targetCount}` : ''} · {timedTier(level).name}
        </span>
        <span className={`timer-value ${low ? 'timer-value--low' : ''}`}>
          ⏱ {(remainingMs / 1000).toFixed(1)} s
        </span>
      </div>
      <div className="timer-bar" style={{ marginBottom: 18 }}>
        <div className={`timer-bar__fill ${low ? 'timer-bar__fill--low' : ''}`} style={{ width: `${ratio}%` }} />
      </div>

      {question && (
        <ExerciseView
          key={question.exercise.id}
          exercise={question.exercise}
          silent
          disabled={answeredRef.current}
          onAnswered={({ correct, answer }) =>
            void settle(correct, Object.values((answer ?? {}) as Record<string, string>).join(' '))
          }
        />
      )}

      {lastResult && (
        <div
          className={`quiz-feedback ${lastResult.correct ? 'quiz-feedback--ok' : 'quiz-feedback--ko'}`}
          style={{ marginTop: 16 }}
        >
          <p className="quiz-feedback__title">
            <Icon name={lastResult.correct ? 'check-circle' : 'x'} size={18} />
            {lastResult.correct ? `Correct · ${(lastResult.ms / 1000).toFixed(1)} s` : 'Incorrect'}
          </p>
          {!lastResult.correct && (
            <p className="ap-body" style={{ marginTop: 6, color: 'inherit' }}>
              {lastResult.given ? `Ta réponse : « ${lastResult.given} » · ` : 'Temps écoulé · '}
              Bonne réponse : « {lastResult.expected} »
            </p>
          )}
          {question && <p className="memo-source">{question.exercise.sourceSentence}</p>}
        </div>
      )}

      <div className="ap-row ap-row--between" style={{ marginTop: 18 }}>
        <span className="ap-caption">
          {stats.correct} bonne{stats.correct > 1 ? 's' : ''} · {stats.errors} erreur
          {stats.errors > 1 ? 's' : ''} · série {stats.currentStreak}
        </span>
        <Button size="sm" variant="ghost" onClick={() => setFinished(true)}>
          Terminer
        </Button>
      </div>
    </main>
  );
}
