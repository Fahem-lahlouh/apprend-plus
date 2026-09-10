import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, Section, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { resolveReviewItem } from '@/services/learningService';
import { isDue } from '@/services/spacedRepetition';
import './progress.css';

const KIND_LABEL: Record<string, string> = {
  lesson: 'Leçon',
  question: 'Question',
  flashcard: 'Flashcard',
  course: 'Cours',
  domain: 'Domaine',
};

export function ReviewScreen() {
  const navigate = useNavigate();
  const toast = useToast();

  const data = useLiveQuery(async () => {
    const [items, schedules] = await Promise.all([db.reviewItems.toArray(), db.schedules.toArray()]);
    return {
      items: items.filter((i) => !i.resolvedAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
      dueCards: schedules.filter((s) => isDue(s)).length,
    };
  }, []);

  const open = (kind: string, refId: string) => {
    if (kind === 'lesson') navigate(`/courses/lesson/${refId}`);
    else if (kind === 'course') navigate(`/courses/course/${refId}`);
    else if (kind === 'domain') navigate(`/courses/domain/${refId}`);
    else if (kind === 'question') navigate(`/games/quiz?question=${refId}`);
    else navigate('/flashcards');
  };

  return (
    <main className="ap-page">
      <TopBar title="À revoir" />

      {!data ? (
        <p className="ap-caption">Chargement…</p>
      ) : (
        <div className="ap-stack">
          {data.dueCards > 0 && (
            <div className="ap-card">
              <p style={{ fontWeight: 700 }}>
                {data.dueCards} flashcard{data.dueCards > 1 ? 's' : ''} à réviser aujourd’hui
              </p>
              <p className="ap-caption" style={{ marginTop: 4 }}>
                La révision espacée planifie automatiquement les cartes que tu risques d’oublier.
              </p>
              <Button block icon="cards" style={{ marginTop: 12 }} onClick={() => navigate('/flashcards')}>
                Lancer la révision
              </Button>
            </div>
          )}

          <Section title="Notions marquées" icon="rotate">
            {data.items.length === 0 ? (
              <EmptyState
                icon="check-circle"
                title="Aucune notion à revoir"
                hint="Utilisé le bouton « À revoir » dans une leçon ou après un quiz rate."
              />
            ) : (
              <div className="ap-list">
                {data.items.map((item) => (
                  <div key={item.id} className="ap-list-card">
                    <button
                      type="button"
                      style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                      onClick={() => open(item.kind, item.refId)}
                    >
                      <span style={{ display: 'block', fontWeight: 700 }}>{item.label}</span>
                      <span className="ap-caption">
                        {KIND_LABEL[item.kind] ?? item.kind}
                        {item.reason ? ` · ${item.reason}` : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Marquer « ${item.label} » comme acquis`}
                      onClick={async () => {
                        await resolveReviewItem(item.id);
                        toast('Notion marquée comme acquise');
                      }}
                    >
                      <Icon name="check-circle" size={20} style={{ color: 'var(--ap-success)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </main>
  );
}
