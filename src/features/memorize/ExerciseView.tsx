import { useEffect, useMemo, useState } from 'react';
import { Button, Icon } from '@/design-system';
import type { MemoExercise } from '@/models';
import { gradeExercise } from '@/services/memorizationEngine';
import { speechService } from '@/services/speechService';
import './memorize.css';

/**
 * Le lecteur d'exercices, entièrement piloté par la forme (`body.shape`).
 *
 * Il ne connaît aucun jeu par son nom : ajouter « Mot manquant chronométré » ou
 * n'importe quel jeu futur ne demande de code ici que si sa forme d'interaction
 * n'existe pas encore. Les quinze jeux actuels tiennent en six formes.
 */
export interface ExerciseViewProps {
  exercise: MemoExercise;
  onAnswered: (result: { correct: boolean; answer: unknown }) => void;
  /** Masque la correction : le jeu chronométré l'affiche lui-même. */
  silent?: boolean;
  disabled?: boolean;
}

export function ExerciseView({ exercise, onAnswered, silent, disabled }: ExerciseViewProps) {
  const [graded, setGraded] = useState<{ correct: boolean; expected: string } | null>(null);

  useEffect(() => setGraded(null), [exercise.id]);

  const submit = (answer: unknown) => {
    if (graded || disabled) return;
    const result = gradeExercise(exercise, answer);
    setGraded({ correct: result.correct, expected: result.expected });
    onAnswered({ correct: result.correct, answer });
  };

  return (
    <div className="quiz-card">
      <p className="memo-instruction">{exercise.instruction}</p>

      {exercise.body.shape === 'fillBlank' && (
        <FillBlankView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}
      {exercise.body.shape === 'reorder' && (
        <ReorderView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}
      {exercise.body.shape === 'trueFalse' && (
        <TrueFalseView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}
      {exercise.body.shape === 'choice' && (
        <ChoiceView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}
      {exercise.body.shape === 'findError' && (
        <FindErrorView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}
      {exercise.body.shape === 'recall' && (
        <RecallView exercise={exercise} graded={graded !== null} onSubmit={submit} />
      )}

      {graded && !silent && (
        <>
          <div className={`quiz-feedback ${graded.correct ? 'quiz-feedback--ok' : 'quiz-feedback--ko'}`}>
            <p className="quiz-feedback__title">
              <Icon name={graded.correct ? 'check-circle' : 'x'} size={18} />
              {graded.correct ? 'Correct' : `Réponse attendue : ${graded.expected}`}
            </p>
          </div>
          <p className="memo-source">{exercise.sourceSentence}</p>
        </>
      )}
    </div>
  );
}

/* ------------------------------- Formes -------------------------------- */

interface ViewProps {
  exercise: MemoExercise;
  graded: boolean;
  onSubmit: (answer: unknown) => void;
}

function FillBlankView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'fillBlank' }>;
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState(body.blanks[0]?.id ?? '');

  useEffect(() => {
    setValues({});
    setActive(body.blanks[0]?.id ?? '');
  }, [exercise.id, body.blanks]);

  const allOptions = useMemo(
    () => [...new Set(body.blanks.flatMap((blank) => blank.options ?? []))],
    [body.blanks],
  );
  const ready = body.blanks.every((blank) => (values[blank.id] ?? '').trim().length > 0);

  const stateOf = (blankId: string, answer: string) => {
    if (!graded) return values[blankId] ? 'memo-blank--filled' : '';
    const given = (values[blankId] ?? '').trim().toLowerCase();
    return given === answer.toLowerCase() ? 'memo-blank--correct' : 'memo-blank--wrong';
  };

  return (
    <>
      <p className="memo-sentence">
        {body.parts.map((part, index) =>
          'text' in part ? (
            <span key={index}>{part.text}</span>
          ) : (
            <span
              key={index}
              className={`memo-blank ${stateOf(part.blankId, body.blanks.find((b) => b.id === part.blankId)!.answer)} ${
                active === part.blankId && !graded ? 'memo-blank--active' : ''
              }`}
              onClick={() => !graded && setActive(part.blankId)}
            >
              {values[part.blankId] || '⋯'}
            </span>
          ),
        )}
      </p>

      {allOptions.length > 0 ? (
        <div className="memo-options">
          {allOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`memo-option ${Object.values(values).includes(option) ? 'memo-option--used' : ''}`}
              disabled={graded}
              onClick={() => {
                const next = { ...values, [active]: option };
                setValues(next);
                const remaining = body.blanks.find((blank) => !next[blank.id]);
                if (remaining) setActive(remaining.id);
                else onSubmit(next);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="quiz-free"
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) onSubmit(values);
          }}
        >
          {body.blanks.map((blank, index) => (
            <input
              key={blank.id}
              className="ap-input"
              value={values[blank.id] ?? ''}
              placeholder={body.blanks.length > 1 ? `Trou ${index + 1}` : 'Le mot manquant'}
              disabled={graded}
              autoFocus={index === 0}
              onChange={(event) => setValues({ ...values, [blank.id]: event.target.value })}
              aria-label={`Trou ${index + 1}`}
            />
          ))}
          {!graded && (
            <Button type="submit" disabled={!ready}>
              Valider
            </Button>
          )}
        </form>
      )}
    </>
  );
}

function ReorderView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'reorder' }>;
  const [picked, setPicked] = useState<number[]>([]);

  useEffect(() => setPicked([]), [exercise.id]);

  const remaining = body.items.map((_, index) => index).filter((index) => !picked.includes(index));

  return (
    <>
      <div className="memo-slot">
        {picked.length === 0 && <span className="ap-caption">Touche les mots dans le bon ordre</span>}
        {picked.map((index, position) => (
          <button
            key={`${index}-${position}`}
            type="button"
            className="memo-token memo-token--picked"
            disabled={graded}
            onClick={() => setPicked(picked.filter((_, i) => i !== position))}
          >
            {body.items[index]}
          </button>
        ))}
      </div>

      <div className="memo-tokens">
        {remaining.map((index) => (
          <button
            key={index}
            type="button"
            className="memo-token"
            disabled={graded}
            onClick={() => setPicked([...picked, index])}
          >
            {body.items[index]}
          </button>
        ))}
      </div>

      {!graded && (
        <Button
          block
          style={{ marginTop: 16 }}
          disabled={picked.length !== body.items.length}
          onClick={() => onSubmit(picked.map((index) => body.items[index]))}
        >
          Valider
        </Button>
      )}
    </>
  );
}

function TrueFalseView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'trueFalse' }>;
  return (
    <>
      <p className="memo-sentence">{body.statement}</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <Button block variant="ghost" disabled={graded} onClick={() => onSubmit(true)}>
          Vrai
        </Button>
        <Button block variant="ghost" disabled={graded} onClick={() => onSubmit(false)}>
          Faux
        </Button>
      </div>
      {graded && body.correctedStatement && (
        <p className="memo-source">Version exacte : {body.correctedStatement}</p>
      )}
    </>
  );
}

function ChoiceView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'choice' }>;
  return (
    <div className="quiz-options">
      {body.options.map((option, index) => (
        <button
          key={option}
          type="button"
          className={`quiz-option ${graded && index === body.correctIndex ? 'quiz-option--correct' : ''}`}
          disabled={graded}
          onClick={() => onSubmit(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function FindErrorView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'findError' }>;
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => setChosen(null), [exercise.id]);

  return (
    <>
      <div className="memo-tokens">
        {body.tokens.map((token, index) => {
          const state = !graded
            ? ''
            : index === body.wrongIndex
              ? 'memo-token--right'
              : index === chosen
                ? 'memo-token--wrong'
                : '';
          return (
            <button
              key={`${token}-${index}`}
              type="button"
              className={`memo-token ${state}`}
              disabled={graded}
              onClick={() => {
                setChosen(index);
                onSubmit(index);
              }}
            >
              {token}
            </button>
          );
        })}
      </div>
      {graded && <p className="memo-source">Le mot correct était « {body.correctWord} ».</p>}
    </>
  );
}

function RecallView({ exercise, graded, onSubmit }: ViewProps) {
  const body = exercise.body as Extract<MemoExercise['body'], { shape: 'recall' }>;
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const isDictation = exercise.kind === 'dictation';

  useEffect(() => {
    setText('');
    setRevealed(false);
  }, [exercise.id]);

  return (
    <>
      {isDictation ? (
        <Button
          icon="volume"
          disabled={!speechService.isSupported()}
          onClick={() => speechService.speak(exercise.prompt, 'fr-FR')}
        >
          Écouter la phrase
        </Button>
      ) : (
        exercise.prompt && <p className="memo-sentence">{exercise.prompt}</p>
      )}

      {body.autoGrade ? (
        <form
          className="quiz-free"
          onSubmit={(event) => {
            event.preventDefault();
            if (text.trim().length > 0) onSubmit(text);
          }}
        >
          <textarea
            className="ap-textarea"
            value={text}
            disabled={graded}
            placeholder="Ta réponse"
            aria-label="Ta réponse"
            onChange={(event) => setText(event.target.value)}
          />
          {!graded && (
            <Button type="submit" disabled={text.trim().length === 0}>
              Valider
            </Button>
          )}
        </form>
      ) : (
        <div style={{ marginTop: 16 }}>
          {revealed ? (
            <>
              <p className="memo-source" style={{ marginTop: 0 }}>
                {body.answer}
              </p>
              {!graded && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <Button block variant="ghost" onClick={() => onSubmit('')}>
                    Je ne savais pas
                  </Button>
                  <Button block onClick={() => onSubmit(body.answer)}>
                    Je savais
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Button block variant="secondary" onClick={() => setRevealed(true)}>
              Afficher la réponse
            </Button>
          )}
        </div>
      )}
    </>
  );
}
