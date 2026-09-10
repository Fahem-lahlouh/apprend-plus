import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { accentClass, EmptyState, Icon, ProgressBar, Section } from '@/design-system';
import { Glyph } from '@/components/Glyph';
import { db } from '@/repositories/db';
import { domainProgress } from '@/services/progression';
import './courses.css';

export function CoursesScreen() {
  const data = useLiveQuery(async () => {
    const [domains, lessons, progress, courses] = await Promise.all([
      db.domains.toArray(),
      db.lessons.toArray(),
      db.lessonProgress.toArray(),
      db.courses.toArray(),
    ]);
    return domains
      .filter((d) => !d.archived)
      .sort((a, b) => a.order - b.order)
      .map((domain) => ({
        domain,
        progress: domainProgress(lessons, progress, domain.id),
        courseCount: courses.filter((c) => c.domainId === domain.id && !c.archived).length,
      }));
  }, []);

  return (
    <main className="ap-page">
      <div className="ap-header">
        <div>
          <h1 className="ap-title-xl">Mes domaines</h1>
          <p className="ap-caption" style={{ marginTop: 4 }}>
            Tout ce que tu apprends, regroupe par domaine.
          </p>
        </div>
        <Link to="/search" className="ap-icon-btn" aria-label="Rechercher">
          <Icon name="search" size={20} />
        </Link>
      </div>

      <div className="ap-stack">
        <Section
          title="Domaines"
          icon="sparkle"
          action={
            <Link to="/courses/new" className="ap-section__link">
              <Icon name="plus" size={16} /> Nouveau
            </Link>
          }
        >
          {!data ? (
            <p className="ap-caption">Chargement…</p>
          ) : data.length === 0 ? (
            <EmptyState icon="book" title="Aucun domaine" hint="Créé ton premier domaine pour commencer." />
          ) : (
            <div className="ap-grid-2">
              {data.map(({ domain, progress, courseCount }) => (
                <Link
                  key={domain.id}
                  to={`/courses/domain/${domain.id}`}
                  className={`ap-tile ${accentClass(domain.accent)}`}
                >
                  <span className="ap-icon-badge">
                    <Glyph value={domain.icon} size={22} />
                  </span>
                  <span style={{ fontWeight: 750, fontSize: 16.5 }}>{domain.name}</span>
                  <span className="ap-caption" style={{ minHeight: 32 }}>
                    {courseCount} cours · {progress.total} leçons
                  </span>
                  <span className="ap-row" style={{ gap: 8 }}>
                    <ProgressBar value={progress.percent} label={`Progression ${domain.name}`} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ap-text-soft)' }}>
                      {progress.percent} %
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Section>

        <div className="ap-list">
          <Link to="/flashcards" className="ap-list-card">
            <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-green">
              <Icon name="cards" size={18} />
            </span>
            <span style={{ flex: 1, fontWeight: 650 }}>Flashcards</span>
            <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
          </Link>
          <Link to="/games" className="ap-list-card">
            <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-pink">
              <Icon name="gamepad" size={18} />
            </span>
            <span style={{ flex: 1, fontWeight: 650 }}>Mini-jeux de révision</span>
            <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
          </Link>
          <Link to="/progress/review" className="ap-list-card">
            <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-amber">
              <Icon name="rotate" size={18} />
            </span>
            <span style={{ flex: 1, fontWeight: 650 }}>À revoir</span>
            <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
          </Link>
        </div>
      </div>
    </main>
  );
}
