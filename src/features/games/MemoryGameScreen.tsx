import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { shuffle } from '@/utils/array';
import { awardGameCompleted } from '@/services/learningService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import './games.css';

interface MemoryCard {
  id: string;
  pairId: string;
  label: string;
  side: 'front' | 'back';
}

const PAIRS_PER_ROUND = 6;

export function MemoryGameScreen() {
  const cards = useLiveQuery(() => db.flashcards.toArray(), []);
  const toast = useToast();
  const [board, setBoard] = useState<MemoryCard[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  useStudyTimer({ activity: 'game' });

  const deal = (source: NonNullable<typeof cards>) => {
    const picked = shuffle(source).slice(0, PAIRS_PER_ROUND);
    const tiles: MemoryCard[] = picked.flatMap((card) => [
      { id: `${card.id}-f`, pairId: card.id, label: card.front, side: 'front' as const },
      { id: `${card.id}-b`, pairId: card.id, label: card.back, side: 'back' as const },
    ]);
    setBoard(shuffle(tiles));
    setOpen([]);
    setMatched([]);
    setMoves(0);
  };

  useEffect(() => {
    if (cards && cards.length >= 2) deal(cards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  useEffect(() => {
    if (open.length !== 2) return undefined;
    const [a, b] = open.map((id) => board.find((card) => card.id === id));
    if (a && b && a.pairId === b.pairId) {
      setMatched((prev) => [...prev, a.pairId]);
      setOpen([]);
      return undefined;
    }
    const timer = setTimeout(() => setOpen([]), 900);
    return () => clearTimeout(timer);
  }, [open, board]);

  const pairsFound = matched.length;
  const totalPairs = board.length / 2;
  const complete = totalPairs > 0 && pairsFound === totalPairs;

  useEffect(() => {
    if (!complete) return;
    void awardGameCompleted().then(() => toast('Partie terminée · +8 XP', 'xp'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  if (!cards) {
    return (
      <main className="ap-page">
        <TopBar title="Mémoire" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (cards.length < 2) {
    return (
      <main className="ap-page">
        <TopBar title="Mémoire" />
        <EmptyState icon="brain" title="Pas assez de flashcards" hint="Créé au moins deux flashcards pour jouer." />
      </main>
    );
  }

  const toggle = (card: MemoryCard) => {
    if (matched.includes(card.pairId) || open.includes(card.id) || open.length === 2) return;
    setOpen((prev) => [...prev, card.id]);
    if (open.length === 1) setMoves((m) => m + 1);
  };

  return (
    <main className="ap-page">
      <TopBar title="Mémoire" />
      <div className="quiz-progress">
        <span className="quiz-progress__label">
          {pairsFound} / {totalPairs} paires
        </span>
        <span className="ap-spacer" />
        <span className="quiz-progress__label">{moves} coups</span>
      </div>

      <div className="memory-grid">
        {board.map((card) => {
          const isMatched = matched.includes(card.pairId);
          const isOpen = open.includes(card.id) || isMatched;
          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${isMatched ? 'memory-card--done' : isOpen ? 'memory-card--open' : ''}`}
              onClick={() => toggle(card)}
              aria-label={isOpen ? card.label : 'Carte face cachee'}
            >
              {isOpen ? card.label : '?'}
            </button>
          );
        })}
      </div>

      {complete && (
        <div className="quiz-card game-result" style={{ marginTop: 20 }}>
          <p className="game-result__score">{moves}</p>
          <p className="ap-body">coups pour retrouver les {totalPairs} paires</p>
          <Button block icon="refresh" style={{ marginTop: 16 }} onClick={() => deal(cards)}>
            Nouvelle partie
          </Button>
        </div>
      )}
    </main>
  );
}
