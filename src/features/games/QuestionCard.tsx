import { useState } from 'react';
import { Button, Icon } from '@/design-system';
import type { QuizQuestion } from '@/models';
import { checkAnswer } from '@/services/learningService';
import './games.css';

export interface QuestionCardProps {
  question: QuizQuestion;
  onAnswered: (correct: boolean) => void;
  onNext?: () => void;
  nextLabel?: string;
  /** Hides the explanation panel, used by the timed challenge. */
  instantMode?: boolean;
}

export function QuestionCard({ question, onAnswered, onNext, nextLabel = 'Suivant', instantMode }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');
  const [result, setResult] = useState<{ correct: boolean } | null>(null);

  const isChoice = question.options !== undefined && question.options.length > 0;

  const submit = (value: string) => {
    if (result) return;
    const outcome = checkAnswer(question, value);
    setSelected(value);
    setResult({ correct: outcome.correct });
    onAnswered(outcome.correct);
  };

  const optionState = (option: string): string => {
    if (!result) return '';
    if (option === question.answer) return 'quiz-option--correct';
    if (option === selected) return 'quiz-option--wrong';
    return 'quiz-option--muted';
  };

  return (
    <div className="quiz-card">
      <p className="ap-eyebrow">{question.topic}</p>
      <h2 className="ap-title-md" style={{ marginTop: 6 }}>
        {question.prompt}
      </h2>

      {question.code && <pre className="ap-code" style={{ marginTop: 12 }}>{question.code}</pre>}

      {isChoice ? (
        <div className="quiz-options">
          {question.options!.map((option) => (
            <button
              key={option}
              type="button"
              className={`quiz-option ${optionState(option)}`}
              onClick={() => submit(option)}
              disabled={result !== null}
            >
              <span>{option}</span>
              {result && option === question.answer && <Icon name="check" size={18} />}
              {result && option === selected && option !== question.answer && <Icon name="x" size={18} />}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="quiz-free"
          onSubmit={(event) => {
            event.preventDefault();
            if (freeText.trim().length > 0) submit(freeText);
          }}
        >
          <input
            className="ap-input"
            value={freeText}
            onChange={(event) => setFreeText(event.target.value)}
            placeholder="Ta réponse"
            disabled={result !== null}
            aria-label="Ta réponse"
          />
          {!result && (
            <Button type="submit" disabled={freeText.trim().length === 0}>
              Valider
            </Button>
          )}
        </form>
      )}

      {result && !instantMode && (
        <div className={`quiz-feedback ${result.correct ? 'quiz-feedback--ok' : 'quiz-feedback--ko'}`}>
          <p className="quiz-feedback__title">
            <Icon name={result.correct ? 'check-circle' : 'x'} size={18} />
            {result.correct ? 'Bonne réponse' : `Réponse attendue : ${question.answer}`}
          </p>
          <p className="ap-body" style={{ marginTop: 6, color: 'inherit' }}>
            {question.explanation}
          </p>
        </div>
      )}

      {result && onNext && (
        <Button block onClick={onNext} style={{ marginTop: 14 }}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
