import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, Icon, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { definitionRepository } from '@/repositories/definitionRepository';
import type { Definition, MemoExercise } from '@/models';
import { MAX_LEVEL, availableGames, generateExercise, getGame } from '@/services/memorizationEngine';
import { loadProgress, loadWeakness, recordExerciseResult } from '@/services/memorizationProgress';
import { analyzeDefinition } from '@/services/textAnalysis';
import { awardGameCompleted, recordSession } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { ExerciseView } from './ExerciseView';
import './memorize.css';

const SESSION_LENGTH = 10;

/**
 * Une session de mémorisation. Chaque exercice est généré juste avant d'être
 * montré, avec le niveau et les points faibles à jour : une erreur influence
 * donc l'exercice suivant, dans la même session.
 */
/**
 * Construit l'exercice suivant : jeu imposé s'il y en a un, sinon tirage parmi
 * ceux que le niveau courant débloque. L'analyse et les points faibles sont
 * relus à chaque fois, donc une erreur pèse dès l'exercice d'après.
 */
async function buildExercise(
  definition: Definition,
  level: number,
  forcedKind?: string,
): Promise<MemoExercise | null> {
  const weakness = await loadWeakness(definition.id);
  const playable = availableGames(analyzeDefinition(definition.text), level);
  if (playable.length === 0) return null;
  const kind = forcedKind ?? playable[Math.floor(Math.random() * playable.length)].id;
  return generateExercise(definition, { kind, level, weakness });
}

export function MemorizeSessionScreen() {
  const { definitionId = '' } = useParams();
  const [params] = useSearchParams();
  const forcedKind = params.get('kind') ?? undefined;
  const navigate = useNavigate();
  const toast = useToast();

  const [definition, setDefinition] = useState<Definition | null>(null);
  const [exercise, setExercise] = useState<MemoExercise | null>(null);
  const [level, setLevel] = useState(1);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useStudyTimer({ activity: 'game', enabled: definition !== null });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const target = await definitionRepository.get(definitionId);
      const progress = await loadProgress(definitionId);
      if (cancelled || !target) {
        setReady(true);
        return;
      }
      setDefinition(target);
      setLevel(progress.level);
      const first = await buildExercise(target, progress.level, forcedKind);
      if (!cancelled) {
        setExercise(first);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [definitionId, forcedKind]);

  const handleAnswered = async ({ correct: isCorrect }: { correct: boolean }) => {
    if (!exercise) return;
    setAnswered(true);
    if (isCorrect) setCorrect((value) => value + 1);
    const progress = await recordExerciseResult(exercise, isCorrect);
    setLevel(progress.level);
  };

  const advance = async () => {
    if (!definition) return;
    const nextIndex = index + 1;
    if (nextIndex >= SESSION_LENGTH) {
      setDone(true);
      await awardGameCompleted();
      await recordSession({ durationSec: 60, activity: 'game', domainId: definition.domainId });
      toast(`Session terminée · ${correct}/${SESSION_LENGTH}`, 'xp');
      return;
    }
    const next = await buildExercise(definition, level, forcedKind);
    setExercise(next);
    setIndex(nextIndex);
    setAnswered(false);
  };

  if (!ready) {
    return (
      <main className="ap-page">
        <TopBar title="Mémoriser" />
        <p className="ap-caption">Préparation…</p>
      </main>
    );
  }

  if (!definition || !exercise) {
    return (
      <main className="ap-page">
        <TopBar title="Mémoriser" />
        <EmptyState
          icon="note"
          title="Pas encore d’exercice possible"
          hint="Ajoute quelques mots à la définition : il en faut au moins quatre."
        />
      </main>
    );
  }

  if (done) {
    const rate = Math.round((correct / SESSION_LENGTH) * 100);
    return (
      <main className="ap-page">
        <TopBar title={definition.title} />
        <div className="quiz-card game-result">
          <p className="game-result__score">
            {correct}/{SESSION_LENGTH}
          </p>
          <p className="ap-body">{rate} % de réussite · niveau {level}/{MAX_LEVEL}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            <Button
              block
              icon="refresh"
              onClick={async () => {
                setIndex(0);
                setCorrect(0);
                setDone(false);
                setAnswered(false);
                setExercise(await buildExercise(definition, level, forcedKind));
              }}
            >
              Nouvelle session
            </Button>
            <Button variant="ghost" block onClick={() => navigate(`/memorize/${definition.id}`)}>
              Retour à la définition
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const game = getGame(exercise.kind);

  return (
    <main className="ap-page">
      <TopBar title={definition.title} />
      <div className="quiz-progress">
        <span className="quiz-progress__label">
          {index + 1} / {SESSION_LENGTH}
        </span>
        <ProgressBar value={(index / SESSION_LENGTH) * 100} sunken label="Progression de la session" />
        <span className="memo-level">Niv. {level}</span>
      </div>

      {game && (
        <p className="ap-caption" style={{ marginBottom: 10 }}>
          <Icon name={game.icon} size={13} /> {game.label}
        </p>
      )}

      <ExerciseView exercise={exercise} onAnswered={handleAnswered} />

      {answered && (
        <Button block style={{ marginTop: 16 }} onClick={advance}>
          {index + 1 >= SESSION_LENGTH ? 'Voir le résultat' : 'Exercice suivant'}
        </Button>
      )}
    </main>
  );
}
