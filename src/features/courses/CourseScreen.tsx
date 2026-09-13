import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { accentClass, Button, EmptyState, Icon, ProgressBar, useConfirm, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { Glyph } from '@/components/Glyph';
import { db } from '@/repositories/db';
import { contentRepository } from '@/repositories/contentRepository';
import { chapterProgress, courseProgress, nextLesson } from '@/services/progression';
import { loadMasteryMap } from '@/services/masteryService';
import { favoriteId, toggleFavorite } from '@/services/learningService';
import { formatMinutes } from '@/utils/date';
import './courses.css';

const LEVEL_LABEL = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' } as const;

export function CourseScreen() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  const data = useLiveQuery(async () => {
    const course = await db.courses.get(courseId);
    if (!course) return null;
    const [domain, chapters, lessons, progress, flashcards, questions, favorite] = await Promise.all([
      db.domains.get(course.domainId),
      contentRepository.listChapters(courseId),
      contentRepository.listLessonsByCourse(courseId),
      db.lessonProgress.where('courseId').equals(courseId).toArray(),
      db.flashcards.where('courseId').equals(courseId).toArray(),
      db.questions.where('courseId').equals(courseId).toArray(),
      db.favorites.get(favoriteId('course', courseId)),
    ]);
    const completed = new Set(progress.filter((p) => p.status === 'completed').map((p) => p.lessonId));
    const mastery = await loadMasteryMap(lessons);
    return {
      mastery,
      course,
      domain,
      chapters,
      lessons,
      completed,
      progress: courseProgress(lessons, progress),
      chapterProgress: Object.fromEntries(
        chapters.map((chapter) => [chapter.id, chapterProgress(lessons, progress, chapter.id)]),
      ),
      next: nextLesson(lessons, progress),
      flashcardCount: flashcards.length,
      questionCount: questions.length,
      isFavorite: favorite !== undefined,
    };
  }, [courseId]);

  if (data === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Cours" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }
  if (data === null) {
    return (
      <main className="ap-page">
        <TopBar title="Cours" />
        <EmptyState icon="book" title="Cours introuvable" />
      </main>
    );
  }

  const { course, domain, chapters, lessons, completed } = data;
  const activeChapter = openChapter ?? chapters.find((c) => data.chapterProgress[c.id].percent < 100)?.id ?? chapters[0]?.id;

  const removeCourse = async () => {
    const ok = await confirm({
      title: `Supprimer « ${course.title} » ?`,
      message: 'Les chapitres, leçons et la progression de ce cours seront supprimes définitivement.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!ok) return;
    await contentRepository.deleteCourse(course.id);
    toast('Cours supprimé');
    navigate(`/courses/domain/${course.domainId}`, { replace: true });
  };

  return (
    <main className="ap-page">
      <TopBar
        title={course.title}
        action={
          <button
            type="button"
            className="ap-back"
            aria-label={data.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={data.isFavorite}
            onClick={async () => {
              const added = await toggleFavorite('course', course.id, course.title);
              toast(added ? 'Ajouté aux favoris' : 'Retire des favoris');
            }}
          >
            <Icon
              name={data.isFavorite ? 'star-filled' : 'star'}
              size={19}
              style={{ color: data.isFavorite ? 'var(--ap-warning)' : undefined }}
            />
          </button>
        }
      />

      <section className={`course-hero ${accentClass(domain?.accent)}`}>
        <div className="course-hero__row">
          <span className="ap-icon-badge">
            <Glyph value={course.icon} size={22} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="ap-title-lg">{course.title}</h2>
            <p className="ap-caption" style={{ marginTop: 3 }}>
              {course.description}
            </p>
          </div>
        </div>
        <div className="course-meta">
          <span className="ap-chip">{LEVEL_LABEL[course.level]}</span>
          <span className="ap-chip">
            <Icon name="clock" size={14} /> {formatMinutes(course.estimatedMinutes)}
          </span>
          <span className="ap-chip">{data.progress.total} leçons</span>
          {data.flashcardCount > 0 && <span className="ap-chip">{data.flashcardCount} cartes</span>}
        </div>
        <div className="ap-row" style={{ gap: 10, marginTop: 14 }}>
          <ProgressBar value={data.progress.percent} label={`Progression ${course.title}`} />
          <span style={{ fontSize: 13, fontWeight: 750 }}>{data.progress.percent} %</span>
        </div>
      </section>

      {data.next && (
        <Button
          block
          icon="play"
          style={{ marginBottom: 20 }}
          onClick={() => navigate(`/courses/lesson/${data.next!.id}`)}
        >
          {data.progress.completed === 0 ? 'Commencer' : 'Continuer'} · {data.next.title}
        </Button>
      )}

      <div className="ap-stack ap-stack--tight">
        {chapters.map((chapter, index) => {
          const chapterLessons = lessons.filter((l) => l.chapterId === chapter.id);
          const isOpen = activeChapter === chapter.id;
          const cp = data.chapterProgress[chapter.id];
          return (
            <div key={chapter.id} className="chapter">
              <button
                type="button"
                className="chapter__head"
                aria-expanded={isOpen}
                onClick={() => setOpenChapter(isOpen ? '' : chapter.id)}
              >
                <span className="chapter__index">{index + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 15 }}>{chapter.title}</span>
                  <span className="ap-caption">
                    {cp.completed}/{cp.total} leçons · {cp.percent} %
                  </span>
                </span>
                <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size={18} style={{ color: 'var(--ap-text-faint)' }} />
              </button>
              {isOpen && (
                <div className="chapter__lessons">
                  {chapterLessons.map((lesson) => {
                    const isDone = completed.has(lesson.id);
                    const isNext = data.next?.id === lesson.id;
                    const mastery = data.mastery.get(lesson.id);
                    return (
                      <Link key={lesson.id} to={`/courses/lesson/${lesson.id}`} className="lesson-row">
                        <span
                          className={`lesson-row__state ${
                            isDone ? 'lesson-row__state--done' : isNext ? 'lesson-row__state--current' : ''
                          }`}
                        >
                          <Icon name={isDone ? 'check' : 'play'} size={12} />
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 600, fontSize: 14.5 }}>{lesson.title}</span>
                          <span className="ap-caption">
                            {lesson.estimatedMinutes} min · {lesson.summary}
                          </span>
                          {mastery && mastery.state !== 'not_started' && (
                            <span style={{ display: 'block', marginTop: 6 }}>
                              <span className={`mastery-chip mastery-chip--${mastery.state}`}>{mastery.label}</span>
                            </span>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                  {chapterLessons.length === 0 && (
                    <p className="ap-caption" style={{ padding: 12 }}>
                      Aucune leçon dans ce chapitre.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {data.questionCount > 0 && (
          <Link to={`/games/quiz?courseId=${course.id}`} className="ap-btn ap-btn--secondary ap-btn--block">
            <Icon name="trophy" size={18} /> Quiz du cours ({data.questionCount} questions)
          </Link>
        )}
        {data.flashcardCount > 0 && (
          <Link to={`/flashcards?courseId=${course.id}`} className="ap-btn ap-btn--ghost ap-btn--block">
            <Icon name="cards" size={18} /> Réviser les flashcards
          </Link>
        )}
        <Link to={`/courses/new?domainId=${course.domainId}&courseId=${course.id}`} className="ap-btn ap-btn--ghost ap-btn--block">
          <Icon name="plus" size={18} /> Ajouter du contenu
        </Link>
        <Button variant="ghost" block icon="trash" onClick={removeCourse}>
          Supprimer ce cours
        </Button>
      </div>
    </main>
  );
}
