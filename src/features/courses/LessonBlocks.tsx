import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Icon } from '@/design-system';
import type { ContentBlock, ExerciseBlock } from '@/models';
import { db } from '@/repositories/db';
import { speechService } from '@/services/speechService';
import { QuestionCard } from '@/features/games/QuestionCard';
import { recordAttempt } from '@/services/learningService';
import { useNavigate } from 'react-router-dom';
import './courses.css';

export function LessonBlockView({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <div className="lesson-block">
          {block.title && <p className="lesson-block__title">{block.title}</p>}
          <p className="ap-body" style={{ color: 'var(--ap-text)' }}>
            {block.text}
          </p>
        </div>
      );

    case 'definition':
      return (
        <div className="lesson-block">
          <div className="block-callout block-définition">
            <p className="block-callout__label">
              <Icon name="sparkle" size={14} /> Définition
            </p>
            <p style={{ fontWeight: 750, marginBottom: 4 }}>{block.term}</p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'example':
      return (
        <div className="lesson-block">
          <div className="block-callout block-example">
            <p className="block-callout__label">
              <Icon name="note" size={14} /> {block.title ?? 'Exemple'}
            </p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'tip':
      return (
        <div className="lesson-block">
          <div className="block-callout block-tip">
            <p className="block-callout__label">
              <Icon name="check-circle" size={14} /> Conseil
            </p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'warning':
      return (
        <div className="lesson-block">
          <div className="block-callout block-warning">
            <p className="block-callout__label">
              <Icon name="bolt" size={14} /> Attention
            </p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'keypoints':
      return (
        <div className="lesson-block">
          <div className="block-callout block-keypoints">
            <p className="block-callout__label">
              <Icon name="bookmark" size={14} /> {block.title ?? 'À retenir'}
            </p>
            <ul>
              {block.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      );

    case 'code':
      return <CodeBlockView block={block} />;

    case 'quiz':
      return <QuizBlockView questionId={block.questionId} />;

    case 'exercise':
      return <ExerciseBlockView block={block} />;

    case 'pronunciation':
      return <PronunciationBlockView block={block} />;

    default:
      return null;
  }
}

function CodeBlockView({ block }: { block: Extract<ContentBlock, { kind: 'code' }> }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="lesson-block">
      {block.caption && <p className="code-block__caption">{block.caption}</p>}
      <pre className="ap-code">{block.code}</pre>
      <div className="code-block__actions">
        <Button size="sm" variant="ghost" onClick={copy} icon={copied ? 'check' : 'note'}>
          {copied ? 'Copie' : 'Copier'}
        </Button>
        {block.runnable && (
          <Button
            size="sm"
            variant="secondary"
            icon="play"
            onClick={() =>
              navigate('/practice/editor', { state: { code: block.code, language: block.language } })
            }
          >
            Exécuter
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizBlockView({ questionId }: { questionId: string }) {
  const question = useLiveQuery(() => db.questions.get(questionId), [questionId]);
  if (!question) return null;
  return (
    <div className="lesson-block">
      <QuestionCard question={question} onAnswered={(correct) => void recordAttempt(question, correct, 'lesson')} />
    </div>
  );
}

function ExerciseBlockView({ block }: { block: ExerciseBlock }) {
  const navigate = useNavigate();
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="lesson-block">
      <div className="ap-card">
        <p className="block-callout__label" style={{ color: 'var(--ap-violet-ink)' }}>
          <Icon name="target" size={14} /> Exercice
        </p>
        <p style={{ fontWeight: 750, fontSize: 15.5, marginBottom: 6 }}>{block.title}</p>
        <p className="ap-body" style={{ color: 'var(--ap-text)' }}>
          {block.statement}
        </p>
        <div className="code-block__actions" style={{ flexWrap: 'wrap' }}>
          <Button
            size="sm"
            icon="code"
            onClick={() => navigate('/practice/editor', { state: { code: block.starterCode, language: block.language } })}
          >
            Ouvrir dans l’éditeur
          </Button>
          {block.hint && (
            <Button size="sm" variant="ghost" onClick={() => setShowHint((v) => !v)}>
              {showHint ? 'Masquer l’indice' : 'Indice'}
            </Button>
          )}
          {block.solution && (
            <Button size="sm" variant="ghost" onClick={() => setShowSolution((v) => !v)}>
              {showSolution ? 'Masquer la solution' : 'Solution'}
            </Button>
          )}
        </div>
        {showHint && block.hint && (
          <div className="block-callout block-tip" style={{ marginTop: 12 }}>
            {block.hint}
          </div>
        )}
        {showSolution && block.solution && <pre className="ap-code" style={{ marginTop: 12 }}>{block.solution}</pre>}
      </div>
    </div>
  );
}

function PronunciationBlockView({ block }: { block: Extract<ContentBlock, { kind: 'pronunciation' }> }) {
  const supported = speechService.isSupported();
  return (
    <div className="lesson-block">
      <div className="pron-card">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 750, fontSize: 17 }}>{block.word}</p>
          {block.phonetic && <p className="ap-caption">{block.phonetic}</p>}
          {block.translation && (
            <p className="ap-caption" style={{ marginTop: 2 }}>
              {block.translation}
            </p>
          )}
          {block.sentence && (
            <p className="ap-body" style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--ap-text)' }}>
              {block.sentence}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button
            size="sm"
            icon="volume"
            disabled={!supported}
            onClick={() => speechService.speak(block.word, block.lang)}
            aria-label={`Écouter ${block.word}`}
          >
            Écouter
          </Button>
          {block.sentence && (
            <Button
              size="sm"
              variant="ghost"
              disabled={!supported}
              onClick={() => speechService.speak(block.sentence!, block.lang)}
            >
              Phrase
            </Button>
          )}
        </div>
      </div>
      {!supported && (
        <p className="ap-caption" style={{ marginTop: 6 }}>
          La synthese vocale n’est pas disponible dans ce navigateur.
        </p>
      )}
    </div>
  );
}
