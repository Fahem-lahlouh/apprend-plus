import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { EmptyState, Icon, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { personalRepository } from '@/repositories/personalRepository';

const KIND_LABEL: Record<string, string> = {
  lesson: 'Leçon',
  course: 'Cours',
  domain: 'Domaine',
  flashcard: 'Flashcard',
  question: 'Question',
};

export function FavoritesScreen() {
  const favorites = useLiveQuery(() => db.favorites.toArray(), []);
  const navigate = useNavigate();
  const toast = useToast();

  const open = (kind: string, refId: string) => {
    if (kind === 'lesson') navigate(`/courses/lesson/${refId}`);
    else if (kind === 'course') navigate(`/courses/course/${refId}`);
    else if (kind === 'domain') navigate(`/courses/domain/${refId}`);
    else navigate('/flashcards');
  };

  return (
    <main className="ap-page">
      <TopBar title="Mes favoris" />
      {!favorites ? (
        <p className="ap-caption">Chargement…</p>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="star"
          title="Aucun favori"
          hint="Touche l’étoile sur un cours ou une leçon pour le retrouver ici."
        />
      ) : (
        <div className="ap-list">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="ap-list-card">
              <button
                type="button"
                style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
                onClick={() => open(favorite.kind, favorite.refId)}
              >
                <span style={{ display: 'block', fontWeight: 700 }}>{favorite.label}</span>
                <span className="ap-caption">{KIND_LABEL[favorite.kind] ?? favorite.kind}</span>
              </button>
              <button
                type="button"
                aria-label={`Retirer ${favorite.label} des favoris`}
                onClick={async () => {
                  await personalRepository.deleteFavorite(favorite.id);
                  toast('Retire des favoris');
                }}
              >
                <Icon name="star-filled" size={19} style={{ color: 'var(--ap-warning)' }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
