import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { accentClass, Button, EmptyState, Icon, ProgressBar, useConfirm, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { Glyph } from '@/components/Glyph';
import { db } from '@/repositories/db';
import { contentRepository } from '@/repositories/contentRepository';
import { courseProgress, domainProgress } from '@/services/progression';
import { formatMinutes } from '@/utils/date';
import './courses.css';

const LEVEL_LABEL = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' } as const;

export function DomainScreen() {
  const { domainId = '' } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const data = useLiveQuery(async () => {
    const domain = await db.domains.get(domainId);
    if (!domain) return null;
    const [paths, courses, lessons, progress, flashcards] = await Promise.all([
      contentRepository.listPaths(domainId),
      contentRepository.listCourses(domainId),
      db.lessons.where('domainId').equals(domainId).toArray(),
      db.lessonProgress.where('domainId').equals(domainId).toArray(),
      db.flashcards.where('domainId').equals(domainId).toArray(),
    ]);
    return {
      domain,
      paths,
      flashcardCount: flashcards.length,
      overall: domainProgress(lessons, progress, domainId),
      courses: courses.map((course) => ({
        course,
        progress: courseProgress(
          lessons.filter((l) => l.courseId === course.id),
          progress,
        ),
      })),
    };
  }, [domainId]);

  if (data === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Domaine" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  if (data === null) {
    return (
      <main className="ap-page">
        <TopBar title="Domaine" />
        <EmptyState icon="book" title="Domaine introuvable" />
      </main>
    );
  }

  const { domain, overall } = data;

  const removeDomain = async () => {
    const ok = await confirm({
      title: `Supprimer « ${domain.name} » ?`,
      message:
        'Tous les cours, chapitres, leçons et la progression associée seront définitivement supprimes de cet appareil.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    await contentRepository.deleteDomain(domain.id);
    toast('Domaine supprimé');
    navigate('/courses', { replace: true });
  };

  return (
    <main className="ap-page">
      <TopBar title={domain.name} />

      <section className={`course-hero ${accentClass(domain.accent)}`}>
        <div className="course-hero__row">
          <span className="ap-icon-badge">
            <Glyph value={domain.icon} size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="ap-title-lg">{domain.name}</h2>
            <p className="ap-caption" style={{ marginTop: 2 }}>
              {domain.description}
            </p>
          </div>
        </div>
        <div className="ap-row" style={{ gap: 10, marginTop: 14 }}>
          <ProgressBar value={overall.percent} label={`Progression ${domain.name}`} />
          <span style={{ fontSize: 13, fontWeight: 750 }}>{overall.percent} %</span>
        </div>
        <p className="ap-caption" style={{ marginTop: 6 }}>
          {overall.completed} / {overall.total} leçons terminées · {data.flashcardCount} flashcards
        </p>
      </section>

      {data.paths.length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3 className="ap-title-md" style={{ marginBottom: 10 }}>
            Parcours
          </h3>
          <div className="ap-list">
            {data.paths.map((path) => {
              const pathCourses = data.courses.filter((c) => c.course.pathId === path.id);
              if (pathCourses.length === 0) return null;
              return (
                <div key={path.id} className="ap-card" style={{ padding: 14 }}>
                  <p style={{ fontWeight: 750, fontSize: 15.5 }}>{path.title}</p>
                  <p className="ap-caption" style={{ marginTop: 2, marginBottom: 10 }}>
                    {path.description}
                  </p>
                  <div className="ap-list">
                    {pathCourses.map(({ course, progress }) => (
                      <Link key={course.id} to={`/courses/course/${course.id}`} className="ap-list-card">
                        <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                          <Glyph value={course.icon} size={18} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 650, fontSize: 14.5 }}>{course.title}</span>
                          <span className="ap-caption">
                            {LEVEL_LABEL[course.level]} · {formatMinutes(course.estimatedMinutes)} · {progress.percent} %
                          </span>
                        </span>
                        <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {data.courses.filter((c) => !c.course.pathId).length > 0 && (
        <section style={{ marginBottom: 20 }}>
          <h3 className="ap-title-md" style={{ marginBottom: 10 }}>
            Cours
          </h3>
          <div className="ap-list">
            {data.courses
              .filter((c) => !c.course.pathId)
              .map(({ course, progress }) => (
                <Link key={course.id} to={`/courses/course/${course.id}`} className="ap-list-card">
                  <span className="ap-icon-badge ap-icon-badge--sm ap-icon-badge--plain ap-accent-violet">
                    <Glyph value={course.icon} size={18} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 650, fontSize: 14.5 }}>{course.title}</span>
                    <span className="ap-caption">{progress.percent} % · {progress.total} leçons</span>
                  </span>
                  <Icon name="chevron-right" size={18} style={{ color: 'var(--ap-text-faint)' }} />
                </Link>
              ))}
          </div>
        </section>
      )}

      {data.courses.length === 0 && (
        <EmptyState icon="book" title="Aucun cours dans ce domaine" hint="Ajouté ton premier cours." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
        <Link to={`/courses/new?domainId=${domain.id}`} className="ap-btn ap-btn--secondary ap-btn--block">
          <Icon name="plus" size={18} /> Ajouter un cours
        </Link>
        <Link to={`/games/quiz?domainId=${domain.id}`} className="ap-btn ap-btn--ghost ap-btn--block">
          <Icon name="trophy" size={18} /> Quiz du domaine
        </Link>
        {!domain.builtIn && (
          <Button variant="ghost" block icon="trash" onClick={removeDomain}>
            Supprimer ce domaine
          </Button>
        )}
      </div>
    </main>
  );
}
