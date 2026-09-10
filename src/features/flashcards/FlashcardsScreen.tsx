import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, Icon, ProgressBar, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import type { CardSchedule, Flashcard, ReviewGrade } from '@/models';
import { buildReviewQueue, reviewFlashcard } from '@/services/learningService';
import { review } from '@/services/spacedRepetition';
import { speechService } from '@/services/speechService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import './flashcards.css';

/** Short human label for the next interval a grade would produce. */
function describeNext(schedule: CardSchedule, grade: ReviewGrade): string {
  const next = review(schedule, grade);
  const minutes = Math.round((new Date(next.dueAt).getTime() - Date.now()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h`;
  return `${Math.max(1, Math.round(minutes / 1440))} j`;
}

export function FlashcardsScreen() {
  const [params] = useSearchParams();
  const courseId = params.get('courseId') ?? undefined;
  const domainId = params.get('domainId') ?? undefined;
  const toast = useToast();

  const [queue, setQueue] = useState<{ card: Flashcard; schedule: CardSchedule }[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useStudyTimer({ activity: 'flashcards', courseId, domainId });

  const load = useCallback(async () => {
    const next = await buildReviewQueue({ courseId, domainId, limit: 20 });
    setQueue(next);
    setIndex(0);
    setRevealed(false);
  }, [courseId, domainId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (queue === null) {
    return (
      <main className="ap-page">
        <TopBar title="Flashcards" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (queue.length === 0) {
    return (
      <main className="ap-page">
        <TopBar title="Flashcards" />
        <EmptyState
          icon="check-circle"
          title="Rien à réviser pour le moment"
          hint="La révision espacée te représente chaque carte au bon moment. Reviens plus tard."
        />
        <Link to="/courses/new" className="ap-btn ap-btn--secondary ap-btn--block" style={{ marginTop: 16 }}>
          <Icon name="plus" size={18} /> Créer une flashcard
        </Link>
      </main>
    );
  }

  if (index >= queue.length) {
    return (
      <main className="ap-page">
        <TopBar title="Flashcards" />
        <div className="ap-card" style={{ textAlign: 'center', padding: 28 }}>
          <p className="ap-title-lg">Session terminée</p>
          <p className="ap-body" style={{ marginTop: 8 }}>
            {reviewed} carte{reviewed > 1 ? 's' : ''} revue{reviewed > 1 ? 's' : ''}.
          </p>
          <Button block icon="refresh" style={{ marginTop: 18 }} onClick={() => void load()}>
            Verifier s’il en reste
          </Button>
        </div>
      </main>
    );
  }

  const { card, schedule } = queue[index];

  const grade = async (value: ReviewGrade) => {
    await reviewFlashcard(card, value);
    setReviewed((r) => r + 1);
    setRevealed(false);
    setIndex((i) => i + 1);
    if (index + 1 === queue.length) toast(`${reviewed + 1} cartes revues`, 'xp');
  };

  return (
    <main className="ap-page">
      <TopBar title="Flashcards" />
      <div className="quiz-progress" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span className="ap-caption" style={{ whiteSpace: 'nowrap' }}>
          {index + 1} / {queue.length}
        </span>
        <ProgressBar value={(index / queue.length) * 100} sunken label="Progression de la session" />
      </div>

      <button type="button" className="fc-card" onClick={() => setRevealed((v) => !v)}>
        <span className="fc-card__side">{revealed ? 'Verso' : 'Recto'}</span>
        {revealed ? (
          <>
            <span className="fc-card__back">{card.back}</span>
            {card.example && <span className="fc-card__example">« {card.example} »</span>}
          </>
        ) : (
          <span className="fc-card__front">{card.front}</span>
        )}
        <span className="fc-hint">{revealed ? 'Touche pour revoir le recto' : 'Touche pour voir la réponse'}</span>
      </button>

      {card.lang && speechService.isSupported() && (
        <Button
          variant="ghost"
          size="sm"
          icon="volume"
          style={{ marginTop: 12 }}
          onClick={() => speechService.speak(revealed && card.example ? card.example : card.front, card.lang)}
        >
          Écouter
        </Button>
      )}

      {revealed ? (
        <div className="fc-actions">
          <button type="button" className="fc-action fc-action--again" onClick={() => void grade('again')}>
            À revoir
            <small>{describeNext(schedule, 'again')}</small>
          </button>
          <button type="button" className="fc-action fc-action--hard" onClick={() => void grade('hard')}>
            Difficile
            <small>{describeNext(schedule, 'hard')}</small>
          </button>
          <button type="button" className="fc-action fc-action--good" onClick={() => void grade('good')}>
            Je connais
            <small>{describeNext(schedule, 'good')}</small>
          </button>
        </div>
      ) : (
        <Button block style={{ marginTop: 18 }} onClick={() => setRevealed(true)}>
          Voir la réponse
        </Button>
      )}
    </main>
  );
}
