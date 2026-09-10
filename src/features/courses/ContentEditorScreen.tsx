import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Icon, useToast } from '@/design-system';
import { TopBar } from '@/app/TopBar';
import { db } from '@/repositories/db';
import { contentRepository } from '@/repositories/contentRepository';
import type { AccentKey, Chapter, ContentBlock, Course, LearningDomain, Lesson, Level } from '@/models';
import { newId, slug } from '@/utils/id';
import './courses.css';

type Tab = 'domain' | 'course' | 'chapter' | 'lesson' | 'flashcard' | 'question';

const TABS: { id: Tab; label: string }[] = [
  { id: 'domain', label: 'Domaine' },
  { id: 'course', label: 'Cours' },
  { id: 'chapter', label: 'Chapitre' },
  { id: 'lesson', label: 'Leçon' },
  { id: 'flashcard', label: 'Flashcard' },
  { id: 'question', label: 'Question' },
];

const ACCENTS: AccentKey[] = ['violet', 'green', 'pink', 'amber', 'blue', 'teal', 'red'];
const LEVELS: { value: Level; label: string }[] = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

/**
 * One screen to create every kind of content. Everything written here becomes
 * a real row in IndexedDB and is immediately usable in courses, quizzes and
 * flashcard reviews.
 */
export function ContentEditorScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>(params.get('courseId') ? 'chapter' : params.get('domainId') ? 'course' : 'domain');

  const catalog = useLiveQuery(async () => {
    const [domains, courses, chapters, lessons] = await Promise.all([
      db.domains.toArray(),
      db.courses.toArray(),
      db.chapters.toArray(),
      db.lessons.toArray(),
    ]);
    return { domains, courses, chapters, lessons };
  }, []);

  if (!catalog) {
    return (
      <main className="ap-page">
        <TopBar title="Ajouter du contenu" />
        <p className="ap-caption">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="ap-page">
      <TopBar title="Ajouter du contenu" />
      <div className="editor-tabs" role="tablist" aria-label="Type de contenu">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`ap-chip ${tab === entry.id ? 'ap-chip--active' : ''}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'domain' && <DomainForm onDone={(id) => navigate(`/courses/domain/${id}`)} nextOrder={catalog.domains.length} toast={toast} />}
      {tab === 'course' && (
        <CourseForm
          domains={catalog.domains}
          defaultDomainId={params.get('domainId') ?? catalog.domains[0]?.id}
          courseCount={catalog.courses.length}
          onDone={(id) => navigate(`/courses/course/${id}`)}
          toast={toast}
        />
      )}
      {tab === 'chapter' && (
        <ChapterForm
          courses={catalog.courses}
          defaultCourseId={params.get('courseId') ?? catalog.courses[0]?.id}
          chapters={catalog.chapters}
          toast={toast}
        />
      )}
      {tab === 'lesson' && <LessonForm catalog={catalog} toast={toast} />}
      {tab === 'flashcard' && <FlashcardForm catalog={catalog} toast={toast} />}
      {tab === 'question' && <QuestionForm catalog={catalog} toast={toast} />}
    </main>
  );
}

interface Catalog {
  domains: LearningDomain[];
  courses: Course[];
  chapters: Chapter[];
  lessons: Lesson[];
}
type ToastFn = (message: string, tone?: 'default' | 'xp') => void;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="ap-field">
      <span className="ap-label">{label}</span>
      {children}
    </label>
  );
}

function DomainForm({ onDone, nextOrder, toast }: { onDone: (id: string) => void; nextOrder: number; toast: ToastFn }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📚');
  const [accent, setAccent] = useState<AccentKey>('violet');

  const submit = async () => {
    const id = `dom-${slug(name)}-${newId().slice(0, 4)}`;
    await contentRepository.putDomain({
      id,
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim() || '📚',
      accent,
      order: nextOrder,
      archived: false,
      builtIn: false,
      createdAt: new Date().toISOString(),
    });
    toast('Domaine créé');
    onDone(id);
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Nom"><input className="ap-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Docker" required /></Field>
      <Field label="Icone (emoji)"><input className="ap-input" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="🐳" maxLength={4} /></Field>
      <Field label="Description"><input className="ap-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Apprendre Docker de zéro" /></Field>
      <Field label="Couleur">
        <div className="ap-chip-row">
          {ACCENTS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Couleur ${value}`}
              aria-pressed={accent === value}
              onClick={() => setAccent(value)}
              className={`ap-accent-${value}`}
              style={{
                width: 38, height: 38, borderRadius: 12, flex: 'none',
                background: 'var(--accent-tint)',
                border: accent === value ? '2.5px solid var(--accent-ink)' : '2.5px solid transparent',
              }}
            />
          ))}
        </div>
      </Field>
      <Button type="submit" block disabled={name.trim().length === 0} icon="plus">Créer le domaine</Button>
    </form>
  );
}

function CourseForm({
  domains, defaultDomainId, courseCount, onDone, toast,
}: {
  domains: Catalog['domains'];
  defaultDomainId?: string;
  courseCount: number;
  onDone: (id: string) => void;
  toast: ToastFn;
}) {
  const [domainId, setDomainId] = useState(defaultDomainId ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📘');
  const [level, setLevel] = useState<Level>('debutant');
  const [tags, setTags] = useState('');

  const submit = async () => {
    const now = new Date().toISOString();
    const id = `crs-${slug(title)}-${newId().slice(0, 4)}`;
    await contentRepository.putCourse({
      id,
      domainId,
      title: title.trim(),
      description: description.trim(),
      icon: icon.trim() || '📘',
      level,
      estimatedMinutes: 0,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      order: courseCount,
      archived: false,
      createdAt: now,
      updatedAt: now,
    });
    toast('Cours créé');
    onDone(id);
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Domaine">
        <select className="ap-select" value={domainId} onChange={(e) => setDomainId(e.target.value)} required>
          <option value="">Choisir…</option>
          {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Nom du cours"><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bonita BPM" required /></Field>
      <Field label="Icone (emoji)"><input className="ap-input" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4} /></Field>
      <Field label="Description"><input className="ap-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Apprendre Bonita BPM" /></Field>
      <Field label="Niveau">
        <select className="ap-select" value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </Field>
      <Field label="Tags (séparés par des virgules)"><input className="ap-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bpm, workflow" /></Field>
      <Button type="submit" block disabled={!domainId || title.trim().length === 0} icon="plus">Créer le cours</Button>
    </form>
  );
}

function ChapterForm({
  courses, defaultCourseId, chapters, toast,
}: {
  courses: Catalog['courses'];
  defaultCourseId?: string;
  chapters: Catalog['chapters'];
  toast: ToastFn;
}) {
  const [courseId, setCourseId] = useState(defaultCourseId ?? '');
  const [title, setTitle] = useState('');

  const submit = async () => {
    const order = chapters.filter((c) => c.courseId === courseId).length;
    await contentRepository.putChapter({ id: `chp-${slug(title)}-${newId().slice(0, 4)}`, courseId, title: title.trim(), order });
    setTitle('');
    toast('Chapitre ajouté');
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Cours">
        <select className="ap-select" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
          <option value="">Choisir…</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      <Field label="Titre du chapitre"><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Les connecteurs" required /></Field>
      <Button type="submit" block disabled={!courseId || title.trim().length === 0} icon="plus">Ajouter le chapitre</Button>
    </form>
  );
}

function LessonForm({ catalog, toast }: { catalog: Catalog; toast: ToastFn }) {
  const [chapterId, setChapterId] = useState(catalog.chapters[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [minutes, setMinutes] = useState(6);
  const [body, setBody] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  const chapter = useMemo(() => catalog.chapters.find((c) => c.id === chapterId), [catalog.chapters, chapterId]);
  const course = useMemo(() => catalog.courses.find((c) => c.id === chapter?.courseId), [catalog.courses, chapter]);

  const submit = async () => {
    if (!chapter || !course) return;
    const blocks: ContentBlock[] = [];
    for (const paragraph of body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
      blocks.push({ kind: 'text', text: paragraph });
    }
    if (codeSnippet.trim().length > 0) {
      blocks.push({ kind: 'code', language: 'text', code: codeSnippet });
    }
    await contentRepository.putLesson({
      id: `lsn-${slug(title)}-${newId().slice(0, 4)}`,
      chapterId: chapter.id,
      courseId: course.id,
      domainId: course.domainId,
      title: title.trim(),
      summary: summary.trim(),
      estimatedMinutes: minutes,
      order: catalog.lessons.filter((l) => l.chapterId === chapter.id).length,
      blocks,
    });
    setTitle('');
    setSummary('');
    setBody('');
    setCodeSnippet('');
    toast('Leçon ajoutée');
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Chapitre">
        <select className="ap-select" value={chapterId} onChange={(e) => setChapterId(e.target.value)} required>
          <option value="">Choisir…</option>
          {catalog.chapters.map((c) => {
            const parent = catalog.courses.find((course) => course.id === c.courseId);
            return <option key={c.id} value={c.id}>{parent?.title} · {c.title}</option>;
          })}
        </select>
      </Field>
      <Field label="Titre"><input className="ap-input" value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label="Résumé court"><input className="ap-input" value={summary} onChange={(e) => setSummary(e.target.value)} /></Field>
      <Field label="Durée estimee (minutes)">
        <input className="ap-input" type="number" min={1} max={120} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
      </Field>
      <Field label="Contenu (un paragraphe par bloc, séparés par une ligne vide)">
        <textarea className="ap-textarea" value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 150 }} />
      </Field>
      <Field label="Bloc de code (optionnel)">
        <textarea className="ap-textarea" value={codeSnippet} onChange={(e) => setCodeSnippet(e.target.value)} style={{ fontFamily: 'var(--ap-font-mono)', fontSize: 13 }} />
      </Field>
      <Button type="submit" block disabled={!chapterId || title.trim().length === 0} icon="plus">Ajouter la leçon</Button>
    </form>
  );
}

function FlashcardForm({ catalog, toast }: { catalog: Catalog; toast: ToastFn }) {
  const [domainId, setDomainId] = useState(catalog.domains[0]?.id ?? '');
  const [courseId, setCourseId] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [exampleText, setExampleText] = useState('');

  const submit = async () => {
    await contentRepository.putFlashcard({
      id: `fc-${newId().slice(0, 8)}`,
      domainId,
      courseId: courseId || undefined,
      front: front.trim(),
      back: back.trim(),
      example: exampleText.trim() || undefined,
      tags: [],
      createdAt: new Date().toISOString(),
    });
    setFront('');
    setBack('');
    setExampleText('');
    toast('Flashcard ajoutée');
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Domaine">
        <select className="ap-select" value={domainId} onChange={(e) => setDomainId(e.target.value)} required>
          {catalog.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Cours (optionnel)">
        <select className="ap-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Aucun</option>
          {catalog.courses.filter((c) => c.domainId === domainId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      <Field label="Recto"><input className="ap-input" value={front} onChange={(e) => setFront(e.target.value)} required /></Field>
      <Field label="Verso"><input className="ap-input" value={back} onChange={(e) => setBack(e.target.value)} required /></Field>
      <Field label="Exemple (optionnel)"><input className="ap-input" value={exampleText} onChange={(e) => setExampleText(e.target.value)} /></Field>
      <Button type="submit" block disabled={front.trim().length === 0 || back.trim().length === 0} icon="plus">Ajouter la flashcard</Button>
    </form>
  );
}

function QuestionForm({ catalog, toast }: { catalog: Catalog; toast: ToastFn }) {
  const [domainId, setDomainId] = useState(catalog.domains[0]?.id ?? '');
  const [courseId, setCourseId] = useState('');
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  const filled = options.map((o) => o.trim()).filter(Boolean);

  const submit = async () => {
    await contentRepository.putQuestion({
      id: `q-${newId().slice(0, 8)}`,
      domainId,
      courseId: courseId || undefined,
      topic: topic.trim() || 'Divers',
      type: 'mcq',
      prompt: prompt.trim(),
      options: filled,
      answer: filled[answerIndex] ?? filled[0],
      explanation: explanation.trim(),
      tags: [],
    });
    setPrompt('');
    setOptions(['', '', '']);
    setAnswerIndex(0);
    setExplanation('');
    toast('Question ajoutée');
  };

  return (
    <form className="ap-stack ap-stack--tight" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
      <Field label="Domaine">
        <select className="ap-select" value={domainId} onChange={(e) => setDomainId(e.target.value)} required>
          {catalog.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Cours (optionnel)">
        <select className="ap-select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">Aucun</option>
          {catalog.courses.filter((c) => c.domainId === domainId).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>
      <Field label="Notion (sert aux statistiques)"><input className="ap-input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Java Streams" /></Field>
      <Field label="Question"><input className="ap-input" value={prompt} onChange={(e) => setPrompt(e.target.value)} required /></Field>
      {options.map((option, index) => (
        <div key={index} className="ap-row">
          <input
            className="ap-input"
            value={option}
            onChange={(e) => setOptions(options.map((o, i) => (i === index ? e.target.value : o)))}
            placeholder={`Réponse ${index + 1}`}
          />
          <button
            type="button"
            className={`ap-chip ${answerIndex === index ? 'ap-chip--active' : ''}`}
            onClick={() => setAnswerIndex(index)}
            aria-label={`Marquer la réponse ${index + 1} comme correcte`}
            aria-pressed={answerIndex === index}
          >
            <Icon name="check" size={15} />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => setOptions([...options, ''])} icon="plus">
        Ajouter une réponse
      </Button>
      <Field label="Explication">
        <textarea className="ap-textarea" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </Field>
      <Button type="submit" block disabled={filled.length < 2 || prompt.trim().length === 0} icon="plus">
        Ajouter la question
      </Button>
    </form>
  );
}
