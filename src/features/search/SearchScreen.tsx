import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { EmptyState, Icon } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { search } from '@/services/searchService';

export function SearchScreen() {
  const [query, setQuery] = useState('');

  const corpus = useLiveQuery(async () => {
    const [domains, courses, lessons, flashcards, questions] = await Promise.all([
      db.domains.toArray(),
      db.courses.toArray(),
      db.lessons.toArray(),
      db.flashcards.toArray(),
      db.questions.toArray(),
    ]);
    return { domains, courses, lessons, flashcards, questions };
  }, []);

  const results = useMemo(() => (corpus ? search(corpus, query) : []), [corpus, query]);

  return (
    <main className="ap-page">
      <TopBar title="Recherche" />

      <label className="ap-field" style={{ marginBottom: 18 }}>
        <span className="ap-sr-only">Rechercher</span>
        <input
          className="ap-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="JVM, présent perfect, jointure…"
          autoFocus
          type="search"
        />
      </label>

      {query.trim().length < 2 ? (
        <EmptyState icon="search" title="Cherche dans tout ton contenu" hint="Leçons, cours, flashcards et questions." />
      ) : results.length === 0 ? (
        <EmptyState icon="search" title={`Aucun résultat pour « ${query} »`} />
      ) : (
        <div className="ap-list">
          {results.map((result) => (
            <Link key={result.id} to={result.to} className="ap-list-card">
              <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                <Icon name={result.icon} size={17} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 650, fontSize: 14.5 }}>{result.title}</span>
                <span className="ap-caption">{result.subtitle}</span>
              </span>
              <Icon name="chevron-right" size={17} style={{ color: 'var(--ap-text-faint)' }} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
