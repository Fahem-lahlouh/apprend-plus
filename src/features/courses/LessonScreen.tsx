import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, EmptyState, Icon, ProgressBar, Sheet, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { contentRepository } from '@/repositories/contentRepository';
import { personalRepository } from '@/repositories/personalRepository';
import {
  addToReview,
  completeLesson,
  favoriteId,
  startLesson,
  toggleFavorite,
} from '@/services/learningService';
import { nextLesson } from '@/services/progression';
import { DIFFICULTY_LABEL, prerequisiteStatuses } from '@/services/curriculum';
import { loadMasteryMap, masteryStates } from '@/services/masteryService';
import { useStudyTimer } from '@/hooks/useStudyTimer';
import { newId } from '@/utils/id';
import { LessonBlockView } from './LessonBlocks';
import './courses.css';

export function LessonScreen() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  const data = useLiveQuery(async () => {
    const lesson = await db.lessons.get(lessonId);
    if (!lesson) return null;
    const [course, siblings, progress, allProgress, notes, favorite] = await Promise.all([
      db.courses.get(lesson.courseId),
      contentRepository.listLessonsByCourse(lesson.courseId),
      db.lessonProgress.get(lesson.id),
      db.lessonProgress.where('courseId').equals(lesson.courseId).toArray(),
      personalRepository.notesForLesson(lesson.id),
      db.favorites.get(favoriteId('lesson', lesson.id)),
    ]);
    // Un prérequis peut vivre dans un autre cours, et même dans un autre
    // domaine : le parcours technique s'appuie sur les leçons du langage. Le
    // graphe se lit donc sur toutes les leçons, sans quoi un prérequis
    // inter-domaines serait silencieusement ignoré.
    const allLessons = await db.lessons.toArray();
    const mastery = await loadMasteryMap(allLessons);
    const lessonsById = new Map(allLessons.map((l) => [l.id, l]));
    const states = masteryStates(mastery);

    // Le titre d'une leçon est souvent un fragment (« for, while, do while ») :
    // hors de son chapitre, il ne dit plus de quelle notion il s'agit.
    const chapters = await db.chapters.bulkGet([...new Set(allLessons.map((l) => l.chapterId))]);
    const chapterTitles = new Map(chapters.filter(Boolean).map((c) => [c!.id, c!.title]));

    const index = siblings.findIndex((l) => l.id === lesson.id);
    return {
      lesson,
      course,
      notes,
      isFavorite: favorite !== undefined,
      isCompleted: progress?.status === 'completed',
      position: { index: index + 1, total: siblings.length },
      next: siblings[index + 1] ?? nextLesson(siblings, allProgress),
      mastery: mastery.get(lesson.id),
      prerequisites: prerequisiteStatuses(lesson, lessonsById, states).map((prereq) => ({
        ...prereq,
        chapter: chapterTitles.get(lessonsById.get(prereq.lessonId)?.chapterId ?? ''),
      })),
    };
  }, [lessonId]);

  useEffect(() => {
    if (data?.lesson) void startLesson(data.lesson);
  }, [data?.lesson]);

  useStudyTimer({
    activity: 'lesson',
    domainId: data?.lesson.domainId,
    courseId: data?.lesson.courseId,
    lessonId: data?.lesson.id,
    enabled: Boolean(data?.lesson),
  });

  if (data === undefined) {
    return (
      <main className="ap-page">
        <TopBar title="Leçon" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }
  if (data === null) {
    return (
      <main className="ap-page">
        <TopBar title="Leçon" />
        <EmptyState icon="note" title="Leçon introuvable" />
      </main>
    );
  }

  const { lesson, course } = data;

  const finish = async () => {
    const award = await completeLesson(lesson);
    if (award) toast(`Leçon terminée · +${award.amount} XP`, 'xp');
    if (award?.newBadges.length) toast(`Nouveau badge debloque !`, 'xp');
    if (data.next && data.next.id !== lesson.id) {
      navigate(`/courses/lesson/${data.next.id}`);
    } else {
      navigate(`/courses/course/${lesson.courseId}`);
    }
  };

  const saveNote = async () => {
    const text = noteDraft.trim();
    if (text.length === 0) return;
    const now = new Date().toISOString();
    await personalRepository.putNote({
      id: newId('note'),
      lessonId: lesson.id,
      courseId: lesson.courseId,
      text,
      createdAt: now,
      updatedAt: now,
    });
    setNoteDraft('');
    setNoteOpen(false);
    toast('Note enregistrée');
  };

  return (
    <main className="ap-page">
      <TopBar
        title={course?.title ?? 'Leçon'}
        action={
          <button
            type="button"
            className="ap-back"
            aria-label={data.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={data.isFavorite}
            onClick={async () => {
              const added = await toggleFavorite('lesson', lesson.id, lesson.title);
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

      <div style={{ marginBottom: 18 }}>
        <div className="ap-row" style={{ gap: 10, marginBottom: 10 }}>
          <ProgressBar
            value={(data.position.index / Math.max(1, data.position.total)) * 100}
            sunken
            label="Avancement dans le cours"
          />
          <span className="ap-caption" style={{ whiteSpace: 'nowrap' }}>
            {data.position.index}/{data.position.total}
          </span>
        </div>
        <h1 className="ap-title-xl" style={{ fontSize: 25 }}>
          {lesson.title}
        </h1>
        <p className="ap-body" style={{ marginTop: 6 }}>
          {lesson.summary}
        </p>
        <div className="course-meta">
          <span className="ap-chip">
            <Icon name="clock" size={14} /> {lesson.estimatedMinutes} min
          </span>
          {lesson.difficulty && <span className="ap-chip">{DIFFICULTY_LABEL[lesson.difficulty]}</span>}
          {data.mastery && (
            <span className={`mastery-chip mastery-chip--${data.mastery.state}`}>{data.mastery.label}</span>
          )}
        </div>
      </div>

      {data.prerequisites.length > 0 && (
        <section className="prereq-card">
          <p className="block-callout__label" style={{ color: 'var(--ap-violet-ink)' }}>
            <Icon name="bookmark" size={14} /> Pour comprendre cette leçon
          </p>
          <ul className="prereq-list">
            {data.prerequisites.map((prereq) => (
              <li key={prereq.lessonId}>
                <Link className="prereq-link" to={`/courses/lesson/${prereq.lessonId}`}>
                  <Icon
                    name={prereq.satisfied ? 'check-circle' : 'bolt'}
                    size={16}
                    style={{ color: prereq.satisfied ? 'var(--ap-green-ink)' : 'var(--ap-amber-ink)' }}
                  />
                  <span className="prereq-link__label">
                    {prereq.chapter && <span className="prereq-link__chapter">{prereq.chapter}</span>}
                    {prereq.title}
                  </span>
                  <span className="prereq-link__state">{prereq.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <article>
        {lesson.blocks.map((block, index) => (
          <LessonBlockView key={`${block.kind}-${index}`} block={block} />
        ))}
      </article>

      {data.notes.length > 0 && (
        <section style={{ marginTop: 8, marginBottom: 18 }}>
          <h2 className="ap-title-md" style={{ marginBottom: 10 }}>
            Mes notes
          </h2>
          <div className="ap-list">
            {data.notes.map((note) => (
              <div key={note.id} className="ap-list-card" style={{ alignItems: 'flex-start' }}>
                <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.5 }}>{note.text}</span>
                <button
                  type="button"
                  aria-label="Supprimer la note"
                  onClick={async () => {
                    await personalRepository.deleteNote(note.id);
                    toast('Note supprimée');
                  }}
                >
                  <Icon name="trash" size={17} style={{ color: 'var(--ap-text-faint)' }} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Button variant="ghost" size="sm" icon="note" onClick={() => setNoteOpen(true)}>
          Ajouter une note
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon="rotate"
          onClick={async () => {
            await addToReview('lesson', lesson.id, lesson.title, 'Marquee à revoir');
            toast('Ajoutée à « À revoir »');
          }}
        >
          À revoir
        </Button>
      </div>

      <div className="lesson-footer">
        <Button block icon={data.isCompleted ? 'chevron-right' : 'check'} onClick={finish}>
          {data.isCompleted ? 'Leçon suivante' : 'Terminer la leçon'}
        </Button>
      </div>

      <Sheet open={noteOpen} onClose={() => setNoteOpen(false)} title="Note personnelle">
        <textarea
          className="ap-textarea"
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
          placeholder="Ce que tu veux retenir de cette leçon…"
          aria-label="Note personnelle"
        />
        <Button block style={{ marginTop: 14 }} onClick={saveNote} disabled={noteDraft.trim().length === 0}>
          Enregistrer
        </Button>
      </Sheet>
    </main>
  );
}
