import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Icon, type IconName } from '@/design-system';
import type {
  ContentBlock,
  ExerciseBlock,
  FlowBlock,
  FollowUp,
  IncidentBlock,
  InterviewBlock,
} from '@/models';
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
          <div className={`block-callout ${block.technical ? 'block-tech-def' : 'block-definition'}`}>
            <p className="block-callout__label">
              <Icon name={block.technical ? 'code' : 'sparkle'} size={14} />{' '}
              {block.technical ? 'Définition technique' : 'Définition simple'}
            </p>
            <p style={{ fontWeight: 750, marginBottom: 4 }}>{block.term}</p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'why':
      return (
        <div className="lesson-block">
          <div className="block-callout block-why">
            <p className="block-callout__label">
              <Icon name="target" size={14} /> Pourquoi on fait ça ?
            </p>
            <p style={{ fontWeight: 750, marginBottom: 4 }}>{block.question}</p>
            <p>{block.text}</p>
          </div>
        </div>
      );

    case 'codeExplain':
      return (
        <div className="lesson-block">
          <p className="lesson-block__title">{block.title ?? 'Le code, ligne par ligne'}</p>
          <ol className="explain-list">
            {block.lines.map((line, index) => (
              <li key={`${line.code}-${index}`} className="explain-list__item">
                <code className="explain-list__code">{line.code}</code>
                <p className="explain-list__text">{line.explain}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'question':
      return <QuestionBlockView question={block.question} answer={block.answer} />;

    case 'compare':
      return (
        <div className="lesson-block">
          {block.title && <p className="lesson-block__title">{block.title}</p>}
          <div className="compare-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col" />
                  <th scope="col">{block.headers[0]}</th>
                  <th scope="col">{block.headers[1]}</th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.left}</td>
                    <td>{row.right}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'badGood':
      return (
        <div className="lesson-block">
          {block.title && <p className="lesson-block__title">{block.title}</p>}
          <div className="badgood">
            <div className="badgood__side badgood__side--bad">
              <p className="block-callout__label">
                <Icon name="x" size={14} /> À éviter
              </p>
              <pre className="ap-code">{block.bad}</pre>
            </div>
            <div className="badgood__side badgood__side--good">
              <p className="block-callout__label">
                <Icon name="check" size={14} /> Mieux
              </p>
              <pre className="ap-code">{block.good}</pre>
            </div>
          </div>
          <div className="block-callout block-tip" style={{ marginTop: 10 }}>
            {block.why}
          </div>
        </div>
      );

    case 'steps':
      return (
        <div className="lesson-block">
          <p className="lesson-block__title">{block.title ?? 'La méthode, dans l’ordre'}</p>
          <ol className="steps-list">
            {block.steps.map((step, index) => (
              <li key={step}>
                <span className="steps-list__index">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'memorize':
      return <MemorizeBlockView definitionId={block.definitionId} label={block.label} />;

    case 'interview':
      return <InterviewBlockView block={block} />;

    case 'flow':
      return <FlowBlockView block={block} />;

    case 'incident':
      return <IncidentBlockView block={block} />;

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

function QuestionBlockView({ question, answer }: { question: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="lesson-block">
      <div className="block-callout block-question">
        <p className="block-callout__label">
          <Icon name="chat" size={14} /> Question de compréhension
        </p>
        <p style={{ fontWeight: 750, marginBottom: 10 }}>{question}</p>
        {revealed ? (
          <p className="question-answer">{answer}</p>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setRevealed(true)}>
            Voir la réponse
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Deux niveaux de réponse, révélés dans l'ordre où on les dit en entretien : on
 * place d'abord la réponse courte, on ne déroule que si on vous laisse dérouler.
 * Les relances restent fermées pour qu'on puisse s'interroger dessus.
 */
function InterviewBlockView({ block }: { block: InterviewBlock }) {
  const [level, setLevel] = useState<0 | 1 | 2>(0);

  return (
    <div className="lesson-block">
      <div className="block-callout block-interview">
        <p className="block-callout__label">
          <Icon name="chat" size={14} /> Comment l’expliquer en entretien ?
        </p>
        <p style={{ fontWeight: 750, marginBottom: 12 }}>{block.question}</p>

        {level === 0 ? (
          <Button size="sm" variant="secondary" onClick={() => setLevel(1)}>
            Voir la réponse courte
          </Button>
        ) : (
          <>
            <div className="interview-answer">
              <p className="interview-answer__tag">Réponse courte · 20 à 30 secondes</p>
              <p>{block.shortAnswer}</p>
            </div>

            {level === 1 ? (
              <Button size="sm" variant="ghost" style={{ marginTop: 10 }} onClick={() => setLevel(2)}>
                Développer (1 à 2 minutes)
              </Button>
            ) : (
              <div className="interview-answer interview-answer--long">
                <p className="interview-answer__tag">Réponse détaillée · 1 à 2 minutes</p>
                <p>{block.detailedAnswer}</p>
              </div>
            )}
          </>
        )}

        {level === 2 && block.followUps && block.followUps.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p className="interview-answer__tag" style={{ marginBottom: 8 }}>
              Les relances qui suivent
            </p>
            <div className="ap-list">
              {block.followUps.map((followUp) => (
                <FollowUpRow key={followUp.question} followUp={followUp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

/**
 * La chaîne de composants. Chaque maillon se déplie sur les quatre questions
 * qui font la différence entre réciter un schéma et le comprendre.
 */
function FlowBlockView({ block }: { block: FlowBlock }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="lesson-block">
      <p className="lesson-block__title">{block.title ?? 'La chaîne, de bout en bout'}</p>
      <ol className="flow-list">
        {block.steps.map((flowStep, index) => {
          const open = openIndex === index;
          return (
            <li key={flowStep.label} className={`flow-step ${open ? 'flow-step--open' : ''}`}>
              <button
                type="button"
                className="flow-step__head"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
              >
                <span className="flow-step__index">{index + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="flow-step__label">{flowStep.label}</span>
                  <span className="flow-step__role">{flowStep.role}</span>
                </span>
                <Icon
                  name={open ? 'chevron-down' : 'chevron-right'}
                  size={16}
                  style={{ color: 'var(--ap-text-faint)' }}
                />
              </button>
              {open && (
                <div className="flow-step__body">
                  <p className="flow-step__field">
                    <span>Ce qu’il fait</span>
                    {flowStep.what}
                  </p>
                  <p className="flow-step__field">
                    <span>Sans lui</span>
                    {flowStep.without}
                  </p>
                  {flowStep.alternatives && (
                    <p className="flow-step__field">
                      <span>À la place</span>
                      {flowStep.alternatives}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Méthode de diagnostic. L'ordre d'affichage est l'ordre de la démarche : on ne
 * montre la correction qu'après les hypothèses, pour ne pas apprendre à sauter
 * directement au remède.
 */
function IncidentBlockView({ block }: { block: IncidentBlock }) {
  const [showFix, setShowFix] = useState(false);

  return (
    <div className="lesson-block">
      <div className="incident-card">
        <p className="block-callout__label" style={{ color: 'var(--ap-red-ink)' }}>
          <Icon name="bolt" size={14} /> Symptôme
        </p>
        <p style={{ fontWeight: 750, fontSize: 15.5, marginBottom: 14 }}>{block.symptom}</p>

        <IncidentSection title="Où regarder" icon="search" items={block.where} />
        <IncidentSection title="Ce qu’il faut récupérer" icon="note" items={block.collect} />

        <p className="incident-section__title">
          <Icon name="target" size={14} /> Hypothèses et comment trancher
        </p>
        <ul className="incident-hypotheses">
          {block.hypotheses.map((hypothesis) => (
            <li key={hypothesis.cause}>
              <span className="incident-hypotheses__cause">{hypothesis.cause}</span>
              <span className="incident-hypotheses__confirm">{hypothesis.confirm}</span>
            </li>
          ))}
        </ul>

        {showFix ? (
          <>
            <div className="block-callout block-tip" style={{ marginTop: 14 }}>
              <p className="block-callout__label">
                <Icon name="check" size={14} /> Correction
              </p>
              <p>{block.fix}</p>
            </div>
            <div className="block-callout block-keypoints" style={{ marginTop: 10 }}>
              <p className="block-callout__label">
                <Icon name="check-circle" size={14} /> Comment valider
              </p>
              <p>{block.validate}</p>
            </div>
          </>
        ) : (
          <Button size="sm" variant="secondary" style={{ marginTop: 14 }} onClick={() => setShowFix(true)}>
            Voir la correction
          </Button>
        )}
      </div>
    </div>
  );
}

function IncidentSection({ title, icon, items }: { title: string; icon: IconName; items: string[] }) {
  return (
    <>
      <p className="incident-section__title">
        <Icon name={icon} size={14} /> {title}
      </p>
      <ul className="incident-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

/**
 * Passerelle vers le moteur de mémorisation. Aucun exercice n'est préparé ici :
 * l'écran de jeu les dérive du texte de la définition au moment de jouer.
 */
function MemorizeBlockView({ definitionId, label }: { definitionId: string; label?: string }) {
  const navigate = useNavigate();
  const definition = useLiveQuery(() => db.definitions.get(definitionId), [definitionId]);
  if (!definition) return null;

  return (
    <div className="lesson-block">
      <div className="memorize-cta">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="block-callout__label" style={{ color: 'var(--ap-violet-ink)' }}>
            <Icon name="brain" size={14} /> Mémoriser
          </p>
          <p style={{ fontWeight: 750, fontSize: 15 }}>{label ?? definition.title}</p>
          <p className="ap-caption" style={{ marginTop: 2 }}>
            Trous, remise en ordre, vrai/faux, récitation… tous les jeux sont générés depuis ce texte.
          </p>
        </div>
        <div className="memorize-cta__actions">
          <Button size="sm" icon="play" onClick={() => navigate(`/memorize/${definition.id}/play`)}>
            Jouer
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(`/memorize/${definition.id}`)}>
            Détail
          </Button>
        </div>
      </div>
    </div>
  );
}
